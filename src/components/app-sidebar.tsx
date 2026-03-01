import React, { useEffect, useState } from "react";
import { Plus, Terminal, History, Trash2, ShieldAlert, Zap } from "lucide-react";
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
import { SessionInfo } from "../../worker/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
export function AppSidebar(): JSX.Element {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const currentSessionId = chatService.getSessionId();
  const loadSessions = async () => {
    const res = await orbitalApi.listSessions();
    if (res.success && res.data) {
      setSessions(res.data);
    }
  };
  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 5000);
    return () => clearInterval(interval);
  }, []);
  const handleNewMission = () => {
    chatService.newSession();
    window.location.reload(); // Force reload to re-init all core data with new ID
  };
  const handleSwitchSession = (id: string) => {
    chatService.switchSession(id);
    window.location.reload();
  };
  const handleDeleteSession = async (id: string) => {
    const res = await orbitalApi.deleteSession(id);
    if (res.success) {
      toast.success("Mission data purged from core.");
      if (id === currentSessionId) {
        handleNewMission();
      } else {
        loadSessions();
      }
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
                    "font-mono text-xs group py-5 px-3 rounded-lg border border-transparent transition-all",
                    currentSessionId === session.id 
                      ? "bg-blue-500/5 border-blue-500/20 text-blue-400 shadow-[inset_0_0_10px_rgba(59,130,246,0.05)]" 
                      : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
                  )}
                >
                  <div className="flex items-center gap-3 truncate w-full">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      currentSessionId === session.id ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" : "bg-slate-800"
                    )} />
                    <span className="truncate">{session.title}</span>
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
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-slate-900 space-y-4">
        <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-tighter">System Alert</span>
          </div>
          <p className="text-[9px] text-slate-500 leading-tight font-mono uppercase">
            AI processing limits are active across all nodes. Exceeding signal quota may cause latency or shutdown.
          </p>
        </div>
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-blue-500" />
            <span className="text-[10px] text-slate-600 font-mono uppercase font-bold tracking-tight">Signal: 98%</span>
          </div>
          <div className="text-[9px] text-slate-800 font-mono">0x4F9...A2</div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}