import type { Message, ChatState, SessionInfo } from '../../worker/types';
export interface ChatResponse {
  success: boolean;
  data?: ChatState;
  error?: string;
  detail?: any;
}
export const MODELS = [
  { id: 'google-ai-studio/gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'google-ai-studio/gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
  { id: 'google-ai-studio/gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
];
class ChatService {
  private sessionId: string;
  private baseUrl: string;
  constructor() {
    const savedSession = typeof window !== 'undefined' ? localStorage.getItem('orbital_session_id') : null;
    this.sessionId = savedSession || crypto.randomUUID();
    if (!savedSession && typeof window !== 'undefined') {
      localStorage.setItem('orbital_session_id', this.sessionId);
    }
    this.baseUrl = `/api/chat/${this.sessionId}`;
  }
  private updateBaseUrl() {
    this.baseUrl = `/api/chat/${this.sessionId}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('orbital_session_id', this.sessionId);
    }
  }
  private async validateSession() {
    if (!this.sessionId || this.sessionId.length < 5) {
      throw new Error(`Invalid Session ID: ${this.sessionId}`);
    }
  }
  async ping(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/ping`);
      return response.ok;
    } catch (e) {
      return false;
    }
  }
  async sendMessage(
    message: string,
    model?: string,
    onChunk?: (chunk: string) => void
  ): Promise<ChatResponse> {
    try {
      await this.validateSession();
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, model, stream: !!onChunk }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Network response was not ok: ${response.status} ${text}`);
      }
      if (onChunk && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            if (chunk) onChunk(chunk);
          }
        } finally {
          reader.releaseLock();
        }
        return { success: true };
      }
      return await response.json();
    } catch (error: any) {
      console.error('[ChatService] sendMessage failure:', {
        message: error.message,
        stack: error.stack,
        sessionId: this.sessionId
      });
      return { success: false, error: error.message || 'Failed to send message' };
    }
  }
  async getMessages(): Promise<ChatResponse> {
    try {
      await this.validateSession();
      const response = await fetch(`${this.baseUrl}/messages`);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text || 'Unknown Error'}`);
      }
      const data = await response.json();
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid JSON response from agent');
      }
      return data;
    } catch (error: any) {
      console.error('[ChatService] getMessages failure:', {
        message: error.message,
        stack: error.stack,
        sessionId: this.sessionId
      });
      return { success: false, error: error.message || 'Failed to load messages' };
    }
  }
  async clearMessages(): Promise<ChatResponse> {
    try {
      await this.validateSession();
      const response = await fetch(`${this.baseUrl}/clear`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('[ChatService] clearMessages failure:', error);
      return { success: false, error: 'Failed to clear messages' };
    }
  }
  getSessionId(): string {
    return this.sessionId;
  }
  newSession(): void {
    this.sessionId = crypto.randomUUID();
    this.updateBaseUrl();
  }
  switchSession(sessionId: string): void {
    this.sessionId = sessionId;
    this.updateBaseUrl();
  }
}
export const chatService = new ChatService();