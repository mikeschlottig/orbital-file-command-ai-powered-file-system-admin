import { ApiResponse, FileRecord, SystemStats, ActionRecord, SessionInfo } from '../../worker/types';
export const orbitalApi = {
  async fetchFiles(sessionId: string): Promise<ApiResponse<FileRecord[]>> {
    try {
      const res = await fetch(`/api/chat/${sessionId}/files`);
      return await res.json();
    } catch (e) {
      return { success: false, error: 'Network failure fetching core files.' };
    }
  },
  async fetchStats(sessionId: string): Promise<ApiResponse<SystemStats>> {
    try {
      const res = await fetch(`/api/chat/${sessionId}/stats`);
      return await res.json();
    } catch (e) {
      return { success: false, error: 'Network failure fetching telemetry.' };
    }
  },
  async fetchActions(sessionId: string): Promise<ApiResponse<ActionRecord[]>> {
    try {
      const res = await fetch(`/api/chat/${sessionId}/actions`);
      return await res.json();
    } catch (e) {
      return { success: false, error: 'Network failure fetching audit trail.' };
    }
  },
  async listSessions(): Promise<ApiResponse<SessionInfo[]>> {
    try {
      const res = await fetch('/api/sessions');
      return await res.json();
    } catch (e) {
      return { success: false, error: 'Network failure listing active nodes.' };
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