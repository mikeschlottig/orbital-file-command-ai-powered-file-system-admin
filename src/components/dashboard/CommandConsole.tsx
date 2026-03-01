import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, Send, Trash2, Cpu, Loader2, Wifi, WifiOff } from 'lucide-react';
import { chatService } from '@/lib/chat';
import { Message } from '../../../worker/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
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
      toast.success("Terminal buffer cleared.");
    } catch (err) {
      toast.error("Process purge failed.");
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
      } else {
        toast.error(response.error || "Neural transmission failure.");
      }
    } catch (err) {
      toast.error("Hardware interruption detected.");
    } finally {
      setIsTyping(false);
      setStreamingContent('');
    }
  };
  return (
    <Card className="flex flex-col h-full bg-slate-950 border-slate-900 rounded-none md:rounded-lg font-mono text-sm shadow-2xl relative overflow-hidden ring-1 ring-slate-900/50">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30" />
      <div className="flex items-center justify-between p-3 border-b border-slate-900 bg-slate-900/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Terminal className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Mission_Control // Console</span>
          <div className="flex items-center gap-1.5 ml-4 border-l border-slate-800 pl-4">
            <div className="flex gap-0.5">
              {[1, 2, 3].map(i => (
                <div key={i} className={cn("w-1 h-3 rounded-full", isTyping ? "bg-blue-500 animate-pulse" : "bg-slate-800")} style={{ animationDelay: `${i*150}ms` }} />
              ))}
            </div>
            <span className="text-[9px] text-slate-600 font-bold">SIGNAL_STRENGTH: 99.4%</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-600 hover:text-rose-500 hover:bg-rose-500/5"
            onClick={handleClear}
            title="Purge Buffer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]" />
        </div>
      </div>
      <ScrollArea className="flex-1 p-5">
        <div className="space-y-8">
          <div className="flex items-center gap-4 text-slate-700">
            <div className="h-[1px] flex-1 bg-slate-900" />
            <span className="text-[9px] font-bold tracking-[0.3em] uppercase">Boot_Sequence: Success</span>
            <div className="h-[1px] flex-1 bg-slate-900" />
          </div>
          {messages.map((m) => (
            <div key={m.id} className={cn("group animate-in fade-in slide-in-from-left-2 duration-300", m.role === 'user' ? "pl-2" : "pl-6")}>
              <div className="flex items-center gap-2 mb-2">
                <span className={cn(
                  "text-[9px] font-black px-1.5 py-0.5 rounded tracking-tighter uppercase",
                  m.role === 'user' ? "bg-blue-900/30 text-blue-400" : "bg-slate-800 text-slate-400"
                )}>[{m.role}]</span>
                <span className="text-[9px] text-slate-700 font-bold">{new Date(m.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className={cn(
                "whitespace-pre-wrap pl-3 leading-relaxed border-l transition-colors group-hover:border-slate-700",
                m.role === 'user' ? "text-blue-300/90 border-blue-900/50" : "text-slate-400 border-slate-900"
              )}>
                {m.content}
              </div>
              {m.toolCalls && (
                <div className="flex flex-wrap gap-2 mt-3 ml-3">
                  {m.toolCalls.map(tc => (
                    <div key={tc.id} className="text-[9px] bg-emerald-500/5 text-emerald-400/80 border border-emerald-500/10 px-2 py-1 rounded-sm flex items-center gap-2 font-black uppercase tracking-tighter">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      EXEC: {tc.name} // OK
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {streamingContent && (
            <div className="pl-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded tracking-tighter uppercase animate-pulse">Assistant</span>
                <span className="text-[9px] text-blue-500 font-bold italic">BITSTREAM_RECV...</span>
              </div>
              <div className="whitespace-pre-wrap pl-3 border-l border-blue-600/30 leading-relaxed text-blue-400/90">
                {streamingContent}
                <span className="inline-block w-2 h-4 bg-blue-600 ml-1 animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.8)] align-middle" />
              </div>
            </div>
          )}
          {isTyping && !streamingContent && (
            <div className="flex items-center gap-3 pl-6 text-slate-600">
              <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
              <span className="text-[10px] font-bold tracking-widest uppercase">Neural_Processing...</span>
            </div>
          )}
          <div ref={scrollRef} className="h-4" />
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-900 bg-slate-900/10 focus-within:bg-slate-900/30 transition-all">
        <div className="flex gap-3 items-center">
          <span className="text-blue-500 font-black text-xs">CMD_❯</span>
          <input
            className="flex-1 bg-transparent outline-none text-slate-200 placeholder:text-slate-800 focus:placeholder:text-slate-700 font-mono text-sm tracking-tight"
            placeholder="Awaiting instruction manifest..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            autoFocus
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className={cn(
              "h-9 w-9 transition-all",
              input.trim() ? "text-blue-500 bg-blue-500/10" : "text-slate-800"
            )}
            disabled={isTyping || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}