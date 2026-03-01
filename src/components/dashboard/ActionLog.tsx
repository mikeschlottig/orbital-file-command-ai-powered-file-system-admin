import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { History, CheckCircle2, AlertCircle, Clock, Filter } from 'lucide-react';
import { ActionRecord } from '../../../worker/types';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
export function ActionLog({ actions }: { actions: ActionRecord[] }) {
  const [filter, setFilter] = useState<'ALL' | 'MOVE' | 'TAG' | 'PURGE'>('ALL');
  const filteredActions = useMemo(() => {
    if (filter === 'ALL') return actions;
    return actions.filter(a => a.type === filter);
  }, [actions, filter]);
  return (
    <Card className="h-full flex flex-col bg-slate-900/40 backdrop-blur-sm border-slate-800 shadow-lg">
      <CardHeader className="py-3 px-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            <CardTitle className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 font-mono">Execution_Audit</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {(['ALL', 'MOVE', 'TAG'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "text-[8px] font-mono font-bold px-1.5 py-0.5 rounded transition-all",
                  filter === f ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-400"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-3">
            <AnimatePresence initial={false}>
              {filteredActions.length > 0 ? (
                filteredActions.map((action) => (
                  <motion.div 
                    key={action.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative pl-3 border-l border-slate-800 space-y-1 hover:border-blue-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <Badge
                        className={cn(
                          "text-[8px] h-4 font-black tracking-tighter",
                          action.type === 'MOVE' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                          action.type === 'TAG' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        )}
                        variant="outline"
                      >
                        {action.type}
                      </Badge>
                      <div 
                        className="flex items-center gap-1 text-[9px] text-slate-600 font-mono"
                        title={new Date(action.timestamp).toLocaleString()}
                      >
                        <Clock className="w-2.5 h-2.5" />
                        {formatDistanceToNow(new Date(action.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight font-mono tracking-tight group-hover:text-slate-200 transition-colors">
                      {action.description}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {action.status === 'success' ? (
                        <>
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                          <span className="text-[8px] text-slate-700 font-black font-mono">VERIFIED</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-2.5 h-2.5 text-rose-500" />
                          <span className="text-[8px] text-slate-700 font-black font-mono">FAILED</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-slate-700 space-y-2 opacity-40">
                  <History className="w-8 h-8" />
                  <span className="text-[10px] font-black font-mono tracking-widest uppercase">Zero_Records_Found</span>
                </div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}