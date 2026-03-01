export interface ApiResponse<T = unknown> { success: boolean; data?: T; error?: string; }
export interface WeatherResult {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
}
export interface MCPResult {
  content: string;
}
export interface ErrorResult {
  error: string;
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
export interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
}
// Phase 1: SQLite Entity Types
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
export interface TagRecord {
  id: string;
  name: string;
}
export interface ActionRecord {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: 'success' | 'failure';
}
export interface SystemStats {
  totalFiles: number;
  totalSize: number;
  typeDistribution: Array<{ name: string; value: number }>;
  recentActivity: Array<{ time: string; count: number }>;
}