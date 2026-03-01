import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { FolderInput, Tag, X, ChevronRight, Zap, Loader2 } from 'lucide-react';
import { orbitalApi } from '@/lib/api';
import { chatService } from '@/lib/chat';
import { toast } from 'sonner';
interface BatchToolbarProps {
  selectedCount: number;
  selectedIds: string[];
  onActionComplete: () => void;
  onClear: () => void;
}
export function BatchToolbar({ selectedCount, selectedIds, onActionComplete, onClear }: BatchToolbarProps) {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const sessionId = chatService.getSessionId();
  const handleAction = async (action: 'MOVE' | 'TAG') => {
    if (!inputValue.trim()) return;
    setIsProcessing(true);
    try {
      const res = await orbitalApi.executeBatchAction(sessionId, {
        fileIds: selectedIds,
        action,
        value: inputValue.trim()
      });
      if (res.success) {
        toast.success(`Batch ${action === 'MOVE' ? 'migration' : 'tagging'} complete.`);
        setInputValue('');
        onActionComplete();
      } else {
        toast.error(res.error || "Batch execution failure.");
      }
    } catch (e) {
      toast.error("Cluster synchronization failure.");
    } finally {
      setIsProcessing(false);
    }
  };
  // Always render AnimatePresence to keep hooks stable, but conditionally render its children
  return (
    <AnimatePresence mode="wait">
      {selectedCount > 0 ? (
        <motion.div
          key="batch-toolbar"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
        >
          <div className="bg-slate-900/90 border border-blue-500/30 backdrop-blur-xl rounded-2xl p-2 pr-4 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(59,130,246,0.2)] flex items-center gap-4">
            <div className="bg-blue-600 rounded-xl px-4 py-2.5 flex items-center gap-3">
              <Zap className="w-4 h-4 text-white fill-white animate-pulse" />
              <div className="flex flex-col">
                <span className="text-white text-xs font-black uppercase leading-none">{selectedCount}</span>
                <span className="text-white/60 text-[9px] font-mono font-bold uppercase leading-none mt-1">OBJECTS</span>
              </div>
            </div>
            <div className="flex-1 flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled={isProcessing}
                    className="h-9 px-3 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800 font-mono text-[10px] gap-2 uppercase tracking-tight"
                  >
                    <FolderInput className="w-3.5 h-3.5" /> Migrate
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 bg-slate-950 border-slate-800 p-3">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase font-mono">Target_Storage_Path</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="/Archive/2024..."
                        className="bg-slate-900 border-slate-800 text-xs h-8"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAction('MOVE')}
                      />
                      <Button size="icon" className="h-8 w-8 bg-blue-600 hover:bg-blue-500" onClick={() => handleAction('MOVE')} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled={isProcessing}
                    className="h-9 px-3 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800 font-mono text-[10px] gap-2 uppercase tracking-tight"
                  >
                    <Tag className="w-3.5 h-3.5" /> Tag
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 bg-slate-950 border-slate-800 p-3">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase font-mono">Tag_Descriptor</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Internal, Verified..."
                        className="bg-slate-900 border-slate-800 text-xs h-8"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAction('TAG')}
                      />
                      <Button size="icon" className="h-8 w-8 bg-emerald-600 hover:bg-emerald-500" onClick={() => handleAction('TAG')} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 transition-colors"
              onClick={onClear}
              disabled={isProcessing}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}