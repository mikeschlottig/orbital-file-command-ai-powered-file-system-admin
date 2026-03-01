import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, Send, Trash2, Cpu, Loader2 } from 'lucide-react';
import { chatService } from '@/lib/chat';
import { Message } from '../../../worker/types';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';
export function CommandConsole({ onCommandCompleted }: { onCommandCompleted: () => void }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const loadHistory = async () => {
      const res = await chatService.getMessages();
      if (res.success && res.data) setMessages(res.data.messages);
    };
    loadHistory();
  }, []);
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, isTyping]);
  const handleClear = async () => {
    try {
      await chatService.clearMessages();
      setMessages([]);
      toast.success("Console history cleared.");
    } catch (err) {
      toast.error("Failed to clear console.");
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    const userText = input.trim();
    setInput('');
    setIsTyping(true);
    setStreamingContent('');
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: userText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    try {
      const response = await chatService.sendMessage(userText, undefined, (chunk) => {
        setStreamingContent(prev => prev + chunk);
      });
      if (response.success) {
        const finalRes = await chatService.getMessages();
        if (finalRes.success && finalRes.data) {
          setMessages(finalRes.data.messages);
        }
        onCommandCompleted();
      }
    } catch (err) {
      toast.error("Process signal interrupted.");
    } finally {
      setIsTyping(false);
      setStreamingContent('');
    }
  };
  return (
    <Card className="flex flex-col h-full bg-slate-950 border-slate-800 rounded-none md:rounded-lg font-mono text-sm shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-transparent opacity-20" />
      <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-2 text-slate-300">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold tracking-tighter">SHELL_ACCESS // MISSION_CON</span>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-slate-500 hover:text-rose-400"
            onClick={handleClear}
            title="Clear Buffer"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          <div className="text-slate-600 text-[10px] uppercase font-bold tracking-widest border-b border-slate-900 pb-2">
            Boot Sequence Complete. Input instructions below.
          </div>
          {messages.map((m) => (
            <div key={m.id} className={cn("space-y-2", m.role === 'user' ? "text-blue-400" : "text-slate-300")}>
              <div className="flex items-center gap-2 opacity-50 text-[10px]">
                <span className="bg-slate-900 px-1 rounded">[{m.role.toUpperCase()}]</span>
                <span>{new Date(m.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="whitespace-pre-wrap pl-3 border-l border-slate-800 leading-relaxed">
                {m.content}
              </div>
              {m.toolCalls && (
                <div className="flex flex-wrap gap-2 pt-1 pl-3">
                  {m.toolCalls.map(tc => (
                    <div key={tc.id} className="text-[9px] bg-blue-500/10 text-blue-400/70 border border-blue-500/10 px-2 py-0.5 rounded-sm flex items-center gap-1">
                      <Cpu className="w-2.5 h-2.5" /> {tc.name.toUpperCase()}:SUCCESS
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {streamingContent && (
            <div className="space-y-2 text-slate-300">
              <div className="flex items-center gap-2 opacity-50 text-[10px]">
                <span className="bg-slate-900 px-1 rounded">[ASSISTANT]</span>
                <span className="animate-pulse">STREAMING_REALTIME...</span>
              </div>
              <div className="whitespace-pre-wrap pl-3 border-l border-blue-900/50 leading-relaxed text-slate-400">
                {streamingContent}
                <span className="inline-block w-1.5 h-4 bg-blue-500 ml-1 animate-pulse" />
              </div>
            </div>
          )}
          {isTyping && !streamingContent && (
            <div className="flex items-center gap-2 text-slate-600 pl-3">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-[10px]">PROCESSING_COMMAND...</span>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-900/10 group focus-within:bg-slate-900/30 transition-all">
        <div className="flex gap-2 items-center">
          <span className="text-blue-600 font-black">❯</span>
          <input
            className="flex-1 bg-transparent outline-none text-slate-200 placeholder:text-slate-800 focus:placeholder:text-slate-700 font-mono text-sm"
            placeholder="Execute command sequence..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
          />
          <Button 
            type="submit" 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 text-slate-600 hover:text-blue-500 hover:bg-blue-500/10"
            disabled={isTyping || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}