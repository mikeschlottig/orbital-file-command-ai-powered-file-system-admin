import React, { useEffect, useState, useCallback } from 'react';
import { SystemHealth } from '@/components/dashboard/SystemHealth';
import { FileExplorer } from '@/components/dashboard/FileExplorer';
import { CommandConsole } from '@/components/dashboard/CommandConsole';
import { ActionLog } from '@/components/dashboard/ActionLog';
import { BatchToolbar } from '@/components/dashboard/BatchToolbar';
import { AppLayout } from '@/components/layout/AppLayout';
import { chatService } from '@/lib/chat';
import { orbitalApi } from '@/lib/api';
import { FileRecord, SystemStats, ActionRecord } from '../../worker/types';
import { Toaster, toast } from 'sonner';
import { Terminal, Shield } from 'lucide-react';
export function HomePage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [actions, setActions] = useState<ActionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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
      toast.error("Process Sync Failure: Connection to core index lost.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);
  const initSession = useCallback(async () => {
    setLoading(true);
    // Ping to ensure DO is ready
    const isOnline = await chatService.ping();
    if (!isOnline) {
      console.warn("Node cold start detected. Waiting for neural link...");
    }
    await orbitalApi.createSession(`Mission ${sessionId.slice(0, 4)}`, sessionId);
    await refreshData();
  }, [sessionId, refreshData]);
  useEffect(() => {
    initSession();
  }, [initSession]);
  const handleActionComplete = () => {
    setSelectedIds(new Set());
    refreshData();
  };
  return (
    <AppLayout container className="bg-slate-950 pb-32">
      <div className="flex flex-col min-h-screen gap-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3">
              <div className="w-3 h-8 bg-blue-600 rounded-sm" />
              ORBITAL // COMMAND
            </h1>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Autonomous Neural File Engine v4.0</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-900/30 p-3 rounded-xl border border-slate-800/50 backdrop-blur-md">
            <div className="flex flex-col pr-4 border-r border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Active_Node</span>
              <span className="text-xs text-blue-400 font-mono truncate max-w-[120px]">{sessionId}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Access</span>
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-emerald-500" />
                <span className="text-xs text-slate-300 font-mono uppercase tracking-tighter font-bold">Encrypted</span>
              </div>
            </div>
          </div>
        </header>
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 min-h-[400px]">
            <Terminal className="w-12 h-12 text-blue-500/20 animate-pulse" />
            <div className="text-slate-600 animate-pulse font-mono text-sm tracking-widest uppercase font-bold">Synchronizing_Core_Index...</div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[450px]">
              <div className="lg:col-span-5 h-full">
                <CommandConsole onCommandCompleted={refreshData} />
              </div>
              <div className="lg:col-span-3 h-full">
                <ActionLog actions={actions} />
              </div>
              <div className="lg:col-span-4 h-full">
                {stats && <SystemHealth stats={stats} />}
              </div>
            </div>
            <div className="flex-1 min-h-[400px]">
              <div className="space-y-4 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black uppercase tracking-[0.25em] text-slate-600 flex items-center gap-2">
                    <div className="w-1 h-4 bg-slate-800" />
                    Central_Binary_Index
                  </h2>
                  <span className="text-[10px] text-slate-700 font-mono font-bold">{files.length} ENTRIES_LOADED</span>
                </div>
                <FileExplorer 
                  files={files} 
                  selectedIds={selectedIds} 
                  onSelectionChange={setSelectedIds} 
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <BatchToolbar 
        selectedCount={selectedIds.size} 
        selectedIds={Array.from(selectedIds)} 
        onActionComplete={handleActionComplete}
        onClear={() => setSelectedIds(new Set())}
      />
      <Toaster position="bottom-right" richColors />
    </AppLayout>
  );
}