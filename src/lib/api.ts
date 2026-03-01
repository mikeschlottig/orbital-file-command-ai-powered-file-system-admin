import { ApiResponse, FileRecord, SystemStats, ActionRecord } from '../../worker/types';
export const orbitalApi = {
  async fetchFiles(sessionId: string): Promise<ApiResponse<FileRecord[]>> {
    const res = await fetch(`/api/chat/${sessionId}/files`);
    return res.json();
  },
  async fetchStats(sessionId: string): Promise<ApiResponse<SystemStats>> {
    const res = await fetch(`/api/chat/${sessionId}/stats`);
    return res.json();
  },
  async fetchActions(sessionId: string): Promise<ApiResponse<ActionRecord[]>> {
    const res = await fetch(`/api/chat/${sessionId}/actions`);
    return res.json();
  }
};