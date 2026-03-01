import { ApiResponse, FileRecord, SystemStats } from '../../worker/types';
export const orbitalApi = {
  async fetchFiles(sessionId: string): Promise<ApiResponse<FileRecord[]>> {
    const res = await fetch(`/api/chat/${sessionId}/files`);
    return res.json();
  },
  async fetchStats(sessionId: string): Promise<ApiResponse<SystemStats>> {
    const res = await fetch(`/api/chat/${sessionId}/stats`);
    return res.json();
  }
};