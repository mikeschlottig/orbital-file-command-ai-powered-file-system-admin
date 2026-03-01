import OpenAI from 'openai';
import type { Message, ToolCall } from './types';
import { getToolDefinitions, executeTool } from './tools';
import { ChatCompletionMessageFunctionToolCall } from 'openai/resources/index.mjs';
export class ChatHandler {
  private client: OpenAI;
  private model: string;
  private sql: SqlStorage;
  constructor(aiGatewayUrl: string, apiKey: string, model: string, sql: SqlStorage) {
    this.client = new OpenAI({
      baseURL: aiGatewayUrl,
      apiKey: apiKey
    });
    this.model = model;
    this.sql = sql;
  }
  async processMessage(
    message: string,
    conversationHistory: Message[],
    onChunk?: (chunk: string) => void
  ): Promise<{
    content: string;
    toolCalls?: ToolCall[];
  }> {
    const messages = this.buildConversationMessages(message, conversationHistory);
    const toolDefinitions = await getToolDefinitions();
    if (onChunk) {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages,
        tools: toolDefinitions,
        tool_choice: 'auto',
        max_completion_tokens: 4000,
        stream: true,
      });
      return this.handleStreamResponse(stream, message, conversationHistory, onChunk);
    }
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages,
      tools: toolDefinitions,
      tool_choice: 'auto',
      max_tokens: 4000,
      stream: false
    });
    return this.handleNonStreamResponse(completion, message, conversationHistory);
  }
  private async handleStreamResponse(
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
    message: string,
    conversationHistory: Message[],
    onChunk: (chunk: string) => void
  ) {
    let fullContent = '';
    const accumulatedToolCalls: ChatCompletionMessageFunctionToolCall[] = [];
    try {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (delta?.content) {
          fullContent += delta.content;
          onChunk(delta.content);
        }
        if (delta?.tool_calls) {
          for (let i = 0; i < delta.tool_calls.length; i++) {
            const dtc = delta.tool_calls[i];
            if (!accumulatedToolCalls[i]) {
              accumulatedToolCalls[i] = {
                id: dtc.id || `tool_${Date.now()}_${i}`,
                type: 'function',
                function: { name: dtc.function?.name || '', arguments: dtc.function?.arguments || '' }
              };
            } else {
              if (dtc.function?.name) accumulatedToolCalls[i].function.name = dtc.function.name;
              if (dtc.function?.arguments) accumulatedToolCalls[i].function.arguments += dtc.function.arguments;
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream processing error:', error);
      throw new Error('Stream processing failed');
    }
    if (accumulatedToolCalls.length > 0) {
      const executedTools = await this.executeToolCalls(accumulatedToolCalls);
      const finalResponse = await this.generateToolResponse(message, conversationHistory, accumulatedToolCalls, executedTools);
      return { content: finalResponse, toolCalls: executedTools };
    }
    return { content: fullContent };
  }
  private async handleNonStreamResponse(
    completion: OpenAI.Chat.Completions.ChatCompletion,
    message: string,
    conversationHistory: Message[]
  ) {
    const responseMessage = completion.choices[0]?.message;
    if (!responseMessage) return { content: 'Error processing request.' };
    if (!responseMessage.tool_calls) return { content: responseMessage.content || 'No response generated.' };
    const toolCalls = await this.executeToolCalls(responseMessage.tool_calls as ChatCompletionMessageFunctionToolCall[]);
    const finalResponse = await this.generateToolResponse(
      message,
      conversationHistory,
      responseMessage.tool_calls,
      toolCalls
    );
    return { content: finalResponse, toolCalls };
  }
  private async executeToolCalls(openAiToolCalls: ChatCompletionMessageFunctionToolCall[]): Promise<ToolCall[]> {
    return Promise.all(
      openAiToolCalls.map(async (tc) => {
        try {
          const args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
          const result = await executeTool(tc.function.name, args, this.sql);
          return { id: tc.id, name: tc.function.name, arguments: args, result };
        } catch (error) {
          return { id: tc.id, name: tc.function.name, arguments: {}, result: { error: 'Execution failed' } };
        }
      })
    );
  }
  private async generateToolResponse(
    userMessage: string,
    history: Message[],
    openAiToolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[],
    toolResults: ToolCall[]
  ): Promise<string> {
    const followUp = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: 'You are an Orbital File Command AI. Use SQL tools to manage the file system. Summarize actions clearly.' },
        ...history.slice(-3).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
        { role: 'assistant', content: null, tool_calls: openAiToolCalls },
        ...toolResults.map((result, index) => ({
          role: 'tool' as const,
          content: JSON.stringify(result.result),
          tool_call_id: openAiToolCalls[index]?.id || result.id
        }))
      ],
      max_tokens: 2000
    });
    return followUp.choices[0]?.message?.content || 'Action completed.';
  }
  private buildConversationMessages(userMessage: string, history: Message[]) {
    return [
      { role: 'system' as const, content: 'You are a file system administrator. Use tools to query, move, and tag files in a SQLite database.' },
      ...history.slice(-5).map(m => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: userMessage }
    ];
  }
  updateModel(newModel: string): void { this.model = newModel; }
}