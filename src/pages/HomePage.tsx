import React, { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SystemHealth } from '@/components/dashboard/SystemHealth';
import { FileExplorer } from '@/components/dashboard/FileExplorer';
import { CommandConsole } from '@/components/dashboard/CommandConsole';
import { chatService } from '@/lib/chat';
import { orbitalApi } from '@/lib/api';
import { FileRecord, SystemStats } from '../../worker/types';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Toaster, toast } from '@/components/ui/sonner';
import { Info } from 'lucide-react';
export function HomePage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const sessionId = chatService.getSessionId();
  const refreshData = useCallback(async () => {
    try {
      const [statsRes, filesRes] = await Promise.all([
        orbitalApi.fetchStats(sessionId),
        orbitalApi.fetchFiles(sessionId)
      ]);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (filesRes.success && filesRes.data) setFiles(filesRes.data);
    } catch (err) {
      console.error("Dashboard refresh failed", err);
      toast.error("Failed to sync system data.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);
  useEffect(() => {
    refreshData();
  }, [refreshData]);
  return (
    <AppLayout className="bg-slate-950 overflow-hidden">
      <div className="flex flex-col h-full p-4 md:p-6 space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-full" />
              Orbital File Command
            </h1>
            <p className="text-slate-500 text-sm">Autonomous File System Management Interface</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-900/50 p-2 px-4 rounded-lg border border-slate-800">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Instance Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-slate-300 font-mono">STABLE_ACTIVE</span>
              </div>
            </div>
          </div>
        </header>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-slate-500 animate-pulse font-mono">SYNCHRONIZING_CORE_INDEX...</div>
          </div>
        ) : (
          <div className="flex-1 min-h-0">
            <ResizablePanelGroup direction="vertical" className="gap-6">
              <ResizablePanel defaultSize={40} minSize={30}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                  <div className="lg:col-span-7 h-full">
                    <CommandConsole onCommandCompleted={refreshData} />
                  </div>
                  <div className="lg:col-span-5 h-full overflow-y-auto">
                    {stats && <SystemHealth stats={stats} />}
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle className="bg-transparent" />
              <ResizablePanel defaultSize={60} minSize={30}>
                <FileExplorer files={files} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        )}
        <footer className="flex items-center justify-between py-2 border-t border-slate-900 text-[10px] text-slate-600 font-mono">
          <div className="flex items-center gap-4">
            <span>SQ_ENGINE: v3.41.2</span>
            <span>OS_BRIDGE: CLOUDFLARE_DO</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Info className="w-3 h-3" />
            AI requests are subject to system-wide limits.
          </div>
        </footer>
      </div>
      <Toaster theme="dark" position="bottom-right" />
    </AppLayout>
  );
}