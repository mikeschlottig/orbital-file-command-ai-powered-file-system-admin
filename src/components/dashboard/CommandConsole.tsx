import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, Send, Trash2, Cpu } from 'lucide-react';
import { chatService } from '@/lib/chat';
import { Message } from '../../../worker/types';
import { cn } from '@/lib/utils';
export function CommandConsole({ onCommandCompleted }: { onCommandCompleted: () => void }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    const userText = input.trim();
    setInput('');
    setIsTyping(true);
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: userText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    try {
      const response = await chatService.sendMessage(userText);
      if (response.success && response.data) {
        setMessages(response.data.messages);
        onCommandCompleted(); // Refresh files and stats
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };
  return (
    <Card className="flex flex-col h-full bg-black/80 border-slate-800 rounded-none md:rounded-lg font-mono text-sm shadow-xl">
      <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2 text-slate-300">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span>Mission Console v1.0.4</span>
        </div>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-700" />
          <div className="w-3 h-3 rounded-full bg-slate-700" />
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div className="text-slate-500 text-xs italic">
            Orbital File Command initialized. Waiting for instructions...
          </div>
          {messages.map((m) => (
            <div key={m.id} className={cn("space-y-1", m.role === 'user' ? "text-blue-400" : "text-slate-300")}>
              <div className="flex items-center gap-2 opacity-70">
                <span className="text-[10px] uppercase">[{m.role}]</span>
                <span className="text-[10px]">{new Date(m.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="whitespace-pre-wrap pl-4 border-l-2 border-slate-800">
                {m.content}
              </div>
              {m.toolCalls && (
                <div className="flex flex-wrap gap-2 pt-1 pl-4">
                  {m.toolCalls.map(tc => (
                    <div key={tc.id} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded flex items-center gap-1">
                      <Cpu className="w-3 h-3" /> {tc.name} executed
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-slate-500">
              <span className="animate-pulse">_</span>
              <span className="text-xs">Processing instruction...</span>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-900/20">
        <div className="flex gap-2">
          <span className="text-blue-500 font-bold">$</span>
          <input 
            className="flex-1 bg-transparent outline-none text-slate-200 placeholder:text-slate-700"
            placeholder="Issue a file command..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type="submit" size="icon" variant="ghost" className="h-6 w-6 text-slate-500 hover:text-blue-400">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}