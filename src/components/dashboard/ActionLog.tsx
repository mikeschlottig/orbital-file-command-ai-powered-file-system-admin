import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { History, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { ActionRecord } from '../../../worker/types';
import { formatDistanceToNow } from 'date-fns';
export function ActionLog({ actions }: { actions: ActionRecord[] }) {
  return (
    <Card className="h-full flex flex-col bg-slate-900/40 backdrop-blur-sm border-slate-800 shadow-lg">
      <CardHeader className="py-3 px-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          <CardTitle className="text-xs uppercase tracking-wider font-mono text-slate-400">Execution Audit</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-3">
            {actions.length > 0 ? (
              actions.map((action) => (
                <div key={action.id} className="group relative pl-4 border-l border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge 
                      className={action.type === 'MOVE' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}
                      variant="outline"
                    >
                      {action.type}
                    </Badge>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(action.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {action.description}
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    {action.status === 'success' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] text-slate-500 font-mono">VERIFIED_COMPLETED</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-rose-500" />
                        <span className="text-[10px] text-slate-500 font-mono">ERROR_ABORTED</span>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-slate-600 space-y-2">
                <History className="w-8 h-8 opacity-20" />
                <span className="text-xs font-mono">NO_AUDIT_TRAILS</span>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}