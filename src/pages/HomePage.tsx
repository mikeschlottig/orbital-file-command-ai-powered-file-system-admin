import React, { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SystemHealth } from '@/components/dashboard/SystemHealth';
import { FileExplorer } from '@/components/dashboard/FileExplorer';
import { CommandConsole } from '@/components/dashboard/CommandConsole';
import { ActionLog } from '@/components/dashboard/ActionLog';
import { chatService } from '@/lib/chat';
import { orbitalApi } from '@/lib/api';
import { FileRecord, SystemStats, ActionRecord } from '../../worker/types';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Toaster, toast } from '@/components/ui/sonner';
import { Info, Terminal } from 'lucide-react';
export function HomePage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [actions, setActions] = useState<ActionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const sessionId = chatService.getSessionId();
  const refreshData = useCallback(async () => {
    try {
      const [statsRes, filesRes, actionsRes] = await Promise.all([
        orbitalApi.fetchStats(sessionId),
        orbitalApi.fetchFiles(sessionId),
        orbitalApi.fetchActions(sessionId)
      ]);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (filesRes.success && filesRes.data) setFiles(filesRes.data);
      if (actionsRes.success && actionsRes.data) setActions(actionsRes.data);
    } catch (err) {
      console.error("Dashboard refresh failed", err);
      toast.error("Process Sync Failure: Unable to update core index.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);
  useEffect(() => {
    refreshData();
  }, [refreshData]);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12 flex flex-col min-h-screen gap-6">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3">
                <div className="w-3 h-8 bg-blue-600 rounded-sm" />
                ORBITAL // COMMAND
              </h1>
              <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Autonomous Neural File Engine v2.1</p>
            </div>
            <div className="flex items-center gap-4 bg-slate-900/30 p-3 rounded-xl border border-slate-800/50 backdrop-blur-md">
              <div className="flex flex-col pr-4 border-r border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">System Node</span>
                <span className="text-xs text-blue-400 font-mono">PRIMARY_CORE_01</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Sync Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-xs text-slate-300 font-mono">OPTIMAL</span>
                </div>
              </div>
            </div>
          </header>
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <Terminal className="w-12 h-12 text-blue-500/20 animate-pulse" />
              <div className="text-slate-600 animate-pulse font-mono text-sm tracking-widest">INITIALIZING_CORE_MANIFEST...</div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-6 min-h-0">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[450px]">
                <div className="lg:col-span-5 h-full overflow-hidden">
                  <CommandConsole onCommandCompleted={refreshData} />
                </div>
                <div className="lg:col-span-3 h-full overflow-hidden">
                  <ActionLog actions={actions} />
                </div>
                <div className="lg:col-span-4 h-full overflow-y-auto">
                  {stats && <SystemHealth stats={stats} />}
                </div>
              </div>
              <div className="flex-1 min-h-[400px]">
                <div className="space-y-4 h-full flex flex-col">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                      <div className="w-1 h-4 bg-slate-700" />
                      Global_Index_Explorer
                    </h2>
                    <span className="text-[10px] text-slate-600 font-mono">{files.length} ENTRIES_LOADED</span>
                  </div>
                  <FileExplorer files={files} />
                </div>
              </div>
            </div>
          )}
          <footer className="flex flex-col md:flex-row items-center justify-between py-4 border-t border-slate-900 text-[10px] text-slate-600 font-mono gap-4">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5"><div className="w-1 h-1 bg-blue-500" /> ENGINE: SQL_LTE v3.41</span>
              <span className="flex items-center gap-1.5"><div className="w-1 h-1 bg-blue-500" /> ARCH: CLOUDFLARE_EDGE</span>
              <span className="flex items-center gap-1.5"><div className="w-1 h-1 bg-blue-500" /> AGENT: CF_DURABLE_OBJ</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-full text-slate-500 border border-slate-800/50">
              <Info className="w-3 h-3 text-blue-500/50" />
              NEURAL_SIGNAL_LIMITS: ACTIVE
            </div>
          </footer>
        </div>
      </div>
      <Toaster theme="dark" position="bottom-right" closeButton />
    </div>
  );
}