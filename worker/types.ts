export interface ApiResponse<T = unknown> { 
  success: boolean; 
  data?: T; 
  error?: string; 
  detail?: any;
}
export interface ErrorResult {
  error: string;
  code?: string;
  detail?: any;
}
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  id: string;
  toolCalls?: ToolCall[];
}
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}
export interface ChatState {
  messages: Message[];
  sessionId: string;
  isProcessing: boolean;
  model: string;
  streamingMessage?: string;
}
export interface SessionInfo {
  id: string;
  title: string;
  createdAt: number;
  lastActive: number;
}
export interface FileRecord {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
}
export interface ActionRecord {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: 'success' | 'failure';
  batch_id?: string;
}
export interface SystemStats {
  totalFiles: number;
  totalSize: number;
  typeDistribution: Array<{ name: string; value: number }>;
  recentActivity: Array<{ time: string; count: number }>;
}
export interface GlobalStats {
  totalSessions: number;
  totalRecordsEstimate: number;
  systemLoad: number;
}
export interface BatchActionRequest {
  fileIds: string[];
  action: 'MOVE' | 'TAG';
  value: string;
}