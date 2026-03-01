import { ApiResponse, FileRecord, SystemStats, ActionRecord, SessionInfo, BatchActionRequest, GlobalStats } from '../../worker/types';
export const orbitalApi = {
  async fetchFiles(sessionId: string): Promise<ApiResponse<FileRecord[]>> {
    try {
      const res = await fetch(`/api/chat/${sessionId}/files`);
      if (!res.ok) throw new Error(`HTTP_${res.status}`);
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Network failure fetching core files.' };
    }
  },
  async fetchStats(sessionId: string): Promise<ApiResponse<SystemStats>> {
    try {
      const res = await fetch(`/api/chat/${sessionId}/stats`);
      if (!res.ok) throw new Error(`HTTP_${res.status}`);
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Network failure fetching telemetry.' };
    }
  },
  async fetchActions(sessionId: string): Promise<ApiResponse<ActionRecord[]>> {
    try {
      const res = await fetch(`/api/chat/${sessionId}/actions`);
      if (!res.ok) throw new Error(`HTTP_${res.status}`);
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Network failure fetching audit trail.' };
    }
  },
  async executeBatchAction(sessionId: string, batchData: BatchActionRequest): Promise<ApiResponse<{ batchId: string }>> {
    try {
      const res = await fetch(`/api/chat/${sessionId}/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchData)
      });
      if (!res.ok) throw new Error(`HTTP_${res.status}`);
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Batch execution failed.' };
    }
  },
  async listSessions(): Promise<ApiResponse<SessionInfo[]>> {
    try {
      const res = await fetch('/api/sessions');
      if (!res.ok) throw new Error(`HTTP_${res.status}`);
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Network failure listing active nodes.' };
    }
  },
  async fetchGlobalStats(): Promise<ApiResponse<GlobalStats>> {
    try {
      const res = await fetch('/api/sessions/stats');
      if (!res.ok) throw new Error(`HTTP_${res.status}`);
      const data = await res.json();
      return {
        success: true,
        data: {
          totalSessions: data.data?.totalSessions || 0,
          totalRecordsEstimate: (data.data?.totalSessions || 0) * 12,
          systemLoad: Math.floor(Math.random() * 15) + 5
        }
      };
    } catch (e: any) {
      return { success: false, error: 'Global telemetry unreachable.' };
    }
  },
  async createSession(title: string, sessionId?: string): Promise<ApiResponse<{ sessionId: string }>> {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, sessionId })
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: 'Network failure creating mission.' };
    }
  },
  async deleteSession(sessionId: string): Promise<ApiResponse<void>> {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      return { success: false, error: 'Network failure purging mission.' };
    }
  }
};