import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import { Terminal, Shield, RefreshCw, Cpu, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
export function HomePage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [actions, setActions] = useState<ActionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const sessionId = chatService.getSessionId();
  const refreshData = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const [statsRes, filesRes, actionsRes] = await Promise.all([
        orbitalApi.fetchStats(sessionId),
        orbitalApi.fetchFiles(sessionId),
        orbitalApi.fetchActions(sessionId)
      ]);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (filesRes.success && filesRes.data) setFiles(filesRes.data);
      if (actionsRes.success && actionsRes.data) setActions(actionsRes.data);
      setError(null);
    } catch (err) {
      console.error("Dashboard refresh failed", err);
      setError("Synchronicity Error: Remote Node unreachable.");
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, [sessionId]);
  const initSession = useCallback(async () => {
    setLoading(true);
    try {
      await orbitalApi.createSession(`Mission ${sessionId.slice(0, 4)}`, sessionId);
      await refreshData();
    } catch (err) {
      setError("Initialization sequence failed.");
      setLoading(false);
    }
  }, [sessionId, refreshData]);
  useEffect(() => {
    initSession();
    // Listen for custom events from nested components
    const handleRefresh = () => refreshData(true);
    window.addEventListener('refresh-dashboard', handleRefresh);
    return () => window.removeEventListener('refresh-dashboard', handleRefresh);
  }, [initSession, refreshData]);
  const handleActionComplete = useCallback(() => {
    setSelectedIds(new Set());
    refreshData();
  }, [refreshData]);
  const memoizedFiles = useMemo(() => files, [files]);
  const memoizedActions = useMemo(() => actions, [actions]);
  if (error) {
    return (
      <AppLayout container className="bg-slate-950 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Terminal className="w-12 h-12 text-rose-500 mx-auto opacity-50" />
          <h2 className="text-rose-500 font-mono font-bold uppercase tracking-widest">{error}</h2>
          <Button variant="outline" onClick={() => window.location.reload()} className="border-rose-900/30 text-rose-400 font-mono text-xs">
            <RefreshCw className="w-4 h-4 mr-2" /> REBOOT_SYSTEM_NODE
          </Button>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout container className="bg-slate-950 pb-32">
      <div className="flex flex-col min-h-screen gap-6 relative">
        {/* Subtle background pulse when refreshing */}
        <motion.div 
          animate={{ opacity: isRefreshing ? 0.3 : 0 }}
          className="fixed inset-0 bg-blue-500/5 pointer-events-none z-0"
        />
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6 relative z-10">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3">
              <div className="w-3 h-8 bg-blue-600 rounded-sm shadow-[0_0_15px_#3b82f6]" />
              ORBITAL // COMMAND
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-slate-500 font-mono text-[10px] uppercase font-black tracking-[0.3em]">Neural File Engine v4.0</p>
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_#10b981]" />
            </div>
          </div>
          <div className="flex items-center gap-4 bg-slate-900/30 p-3 rounded-xl border border-slate-800/50 backdrop-blur-md">
            <div className="flex flex-col pr-4 border-r border-slate-800">
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Mission_UID</span>
              <span className="text-[11px] text-blue-400 font-mono truncate max-w-[120px] uppercase font-bold">{sessionId.slice(0, 8)}...</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Neural_Link</span>
              <div className="flex items-center gap-2">
                <Activity className={cn("w-3 h-3 transition-colors", isRefreshing ? "text-blue-500 animate-pulse" : "text-emerald-500")} />
                <span className="text-[10px] text-slate-300 font-mono uppercase tracking-tighter font-black">Synchronized</span>
              </div>
            </div>
          </div>
        </header>
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 min-h-[400px]">
            <div className="relative">
              <Terminal className="w-16 h-16 text-blue-500/10 animate-pulse" />
              <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-600 animate-spin duration-3000" />
            </div>
            <div className="text-slate-600 animate-pulse font-mono text-[10px] tracking-[0.4em] uppercase font-black">Initiating_Link_Sequence...</div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col gap-6 relative z-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[450px]">
              <div className="lg:col-span-5 h-full">
                <CommandConsole onCommandCompleted={() => refreshData(true)} />
              </div>
              <div className="lg:col-span-3 h-full">
                <ActionLog actions={memoizedActions} />
              </div>
              <div className="lg:col-span-4 h-full">
                {stats && <SystemHealth stats={stats} />}
              </div>
            </div>
            <div className="flex-1 min-h-[400px]">
              <div className="space-y-4 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 flex items-center gap-2 font-mono">
                    <div className="w-1 h-3 bg-slate-800" />
                    Central_Binary_Index
                  </h2>
                  <span className="text-[9px] text-slate-700 font-mono font-black uppercase">{memoizedFiles.length} Clusters_Mapped</span>
                </div>
                <FileExplorer
                  files={memoizedFiles}
                  selectedIds={selectedIds}
                  onSelectionChange={setSelectedIds}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
      <BatchToolbar
        selectedCount={selectedIds.size}
        selectedIds={Array.from(selectedIds)}
        onActionComplete={handleActionComplete}
        onClear={() => setSelectedIds(new Set())}
      />
      <Toaster position="bottom-right" richColors theme="dark" />
      <footer className="fixed bottom-0 left-0 w-full p-4 flex justify-center pointer-events-none z-20">
        <div className="bg-slate-950/80 backdrop-blur-md border border-slate-900 rounded-full px-4 py-1.5 flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
          <span className="text-[8px] font-mono font-black text-slate-600 uppercase tracking-widest">Neural Link: Stable // AI Requests Subject to Limit</span>
        </div>
      </footer>
    </AppLayout>
  );
}