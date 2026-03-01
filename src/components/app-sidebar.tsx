import React, { useEffect, useState } from "react";
import { Plus, Terminal, History, Trash2, ShieldAlert, Zap, Globe } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import { orbitalApi } from "@/lib/api";
import { chatService } from "@/lib/chat";
import { SessionInfo, GlobalStats } from "../../worker/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
export function AppSidebar(): JSX.Element {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const currentSessionId = chatService.getSessionId();
  const loadData = async () => {
    const [sRes, gRes] = await Promise.all([
      orbitalApi.listSessions(),
      orbitalApi.fetchGlobalStats()
    ]);
    if (sRes.success && sRes.data) setSessions(sRes.data);
    if (gRes.success && gRes.data) setGlobalStats(gRes.data);
  };
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);
  const handleNewMission = () => {
    chatService.newSession();
    window.location.reload();
  };
  const handleSwitchSession = (id: string) => {
    chatService.switchSession(id);
    window.location.reload();
  };
  const handleDeleteSession = async (id: string) => {
    const res = await orbitalApi.deleteSession(id);
    if (res.success) {
      toast.success("Mission data purged from core.");
      if (id === currentSessionId) handleNewMission();
      else loadData();
    }
  };
  return (
    <Sidebar className="border-r border-slate-900 bg-slate-950">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <Terminal className="text-white w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-white tracking-tighter uppercase">Orbital_Cmd</span>
            <span className="text-[9px] text-slate-500 font-mono">v4.0.0-PRO</span>
          </div>
        </div>
        <Button
          onClick={handleNewMission}
          className="mt-4 w-full bg-slate-900 hover:bg-blue-900/40 text-blue-400 border border-slate-800 hover:border-blue-500/50 transition-all font-mono text-xs gap-2"
        >
          <Plus className="w-3.5 h-3.5" /> NEW_MISSION_INIT
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-600 tracking-[0.2em] flex items-center gap-2">
              <History className="w-3 h-3" /> Mission_Manifest
            </span>
          </div>
          <SidebarMenu className="px-2">
            {sessions.map((session) => (
              <SidebarMenuItem key={session.id}>
                <SidebarMenuButton
                  isActive={currentSessionId === session.id}
                  onClick={() => handleSwitchSession(session.id)}
                  className={cn(
                    "font-mono text-xs group py-6 px-3 rounded-lg border border-transparent transition-all",
                    currentSessionId === session.id
                      ? "bg-blue-500/5 border-blue-500/20 text-blue-400"
                      : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
                  )}
                >
                  <div className="flex flex-col w-full gap-1">
                    <div className="flex items-center gap-2 truncate">
                      <div className={cn(
                        "w-1 h-1 rounded-full",
                        currentSessionId === session.id ? "bg-blue-500" : "bg-slate-800"
                      )} />
                      <span className="truncate font-bold">{session.title}</span>
                    </div>
                    <span className="text-[8px] text-slate-700 ml-3">
                      L_ACT: {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}
                    </span>
                  </div>
                </SidebarMenuButton>
                <SidebarMenuAction
                  onClick={() => handleDeleteSession(session.id)}
                  className="opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </SidebarMenuAction>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-4">
          <div className="px-4 mb-3">
            <span className="text-[10px] uppercase font-bold text-slate-600 tracking-[0.2em] flex items-center gap-2">
              <Globe className="w-3 h-3" /> Global_Telemetry
            </span>
          </div>
          <div className="px-4 space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase">
                <span>Active_Nodes</span>
                <span className="text-blue-500 font-bold">{globalStats?.totalSessions || 0}</span>
              </div>
              <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-[45%]" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase">
                <span>Index_Volume</span>
                <span className="text-emerald-500 font-bold">{globalStats?.totalRecordsEstimate || 0} RECS</span>
              </div>
              <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full w-[30%]" />
              </div>
            </div>
            <div className="pt-2">
              <div className="flex items-center gap-2 p-2 rounded bg-slate-900/50 border border-slate-900">
                <Zap className="w-2.5 h-2.5 text-blue-500" />
                <span className="text-[8px] font-mono text-slate-600 uppercase font-black">Sync_Rate: 14.2ms</span>
              </div>
            </div>
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-slate-900 space-y-4">
        <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-tighter">System Alert</span>
          </div>
          <p className="text-[9px] text-slate-500 leading-tight font-mono uppercase">
            Cluster synchronization limits are active. Latency may increase during batch operations.
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}