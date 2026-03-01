import { Agent } from 'agents';
import type { Env } from './core-utils';
import type { ChatState, FileRecord, SystemStats } from './types';
import { ChatHandler } from './chat';
import { API_RESPONSES } from './config';
import { createMessage, createStreamResponse, createEncoder } from './utils';
export class ChatAgent extends Agent<Env, ChatState> {
  private chatHandler?: ChatHandler;
  initialState: ChatState = {
    messages: [],
    sessionId: crypto.randomUUID(),
    isProcessing: false,
    model: 'google-ai-studio/gemini-2.0-flash'
  };
  async onStart(): Promise<void> {
    // Initialize SQLite Database
    this.initializeDB();
    this.chatHandler = new ChatHandler(
      this.env.CF_AI_BASE_URL,
      this.env.CF_AI_API_KEY,
      this.state.model,
      this.ctx.storage.sql
    );
  }
  private initializeDB() {
    const sql = this.ctx.storage.sql;
    // Create Tables
    sql.exec(`
      CREATE TABLE IF NOT EXISTS Files (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        size INTEGER DEFAULT 0,
        type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS Tags (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
      );
      CREATE TABLE IF NOT EXISTS FileTags (
        file_id TEXT,
        tag_id TEXT,
        PRIMARY KEY (file_id, tag_id),
        FOREIGN KEY (file_id) REFERENCES Files(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES Tags(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS Actions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Seed if empty
    const fileCount = sql.exec(`SELECT count(*) as count FROM Files`).one();
    if ((fileCount as any).count === 0) {
      this.seedData();
    }
  }
  private seedData() {
    const sql = this.ctx.storage.sql;
    const files = [
      ['f1', 'report_v1.pdf', '/Documents', 1024 * 500, 'pdf'],
      ['f2', 'dashboard_final.sketch', '/Projects', 1024 * 15000, 'sketch'],
      ['f3', 'profile_pic.png', '/Media/Images', 1024 * 800, 'image'],
      ['f4', 'backup_2023.zip', '/Backups', 1024 * 200000, 'archive'],
      ['f5', 'index.ts', '/Source', 4096, 'typescript'],
      ['f6', 'styles.css', '/Source', 2048, 'css'],
      ['f7', 'intro_video.mp4', '/Media/Videos', 1024 * 50000, 'video'],
    ];
    for (const f of files) {
      sql.exec(`INSERT INTO Files (id, name, path, size, type) VALUES (?, ?, ?, ?, ?)`, ...f);
    }
    sql.exec(`INSERT INTO Tags (id, name) VALUES ('t1', 'Important'), ('t2', 'Work'), ('t3', 'Private')`);
    sql.exec(`INSERT INTO FileTags (file_id, tag_id) VALUES ('f1', 't1'), ('f1', 't2'), ('f2', 't2')`);
  }
  async onRequest(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const method = request.method;
      if (method === 'GET' && url.pathname === '/files') {
        return this.handleGetFiles();
      }
      if (method === 'GET' && url.pathname === '/stats') {
        return this.handleGetStats();
      }
      if (method === 'GET' && url.pathname === '/messages') {
        return this.handleGetMessages();
      }
      if (method === 'POST' && url.pathname === '/chat') {
        return this.handleChatMessage(await request.json());
      }
      if (method === 'DELETE' && url.pathname === '/clear') {
        return this.handleClearMessages();
      }
      return Response.json({ success: false, error: API_RESPONSES.NOT_FOUND }, { status: 404 });
    } catch (error) {
      console.error('Request handling error:', error);
      return Response.json({ success: false, error: API_RESPONSES.INTERNAL_ERROR }, { status: 500 });
    }
  }
  private handleGetFiles(): Response {
    const sql = this.ctx.storage.sql;
    const rows = sql.exec(`
      SELECT f.*, GROUP_CONCAT(t.name) as tags 
      FROM Files f 
      LEFT JOIN FileTags ft ON f.id = ft.file_id 
      LEFT JOIN Tags t ON ft.tag_id = t.id 
      GROUP BY f.id
      ORDER BY updated_at DESC
    `).toArray();
    const files = rows.map(r => ({
      ...r,
      tags: (r as any).tags ? (r as any).tags.split(',') : []
    }));
    return Response.json({ success: true, data: files });
  }
  private handleGetStats(): Response {
    const sql = this.ctx.storage.sql;
    const totals = sql.exec(`SELECT count(*) as count, sum(size) as size FROM Files`).one() as any;
    const distribution = sql.exec(`SELECT type as name, count(*) as value FROM Files GROUP BY type`).toArray();
    // Mock activity for sparklines
    const activity = Array.from({ length: 7 }, (_, i) => ({
      time: `${i + 1}d ago`,
      count: Math.floor(Math.random() * 10)
    }));
    const stats: SystemStats = {
      totalFiles: totals.count || 0,
      totalSize: totals.size || 0,
      typeDistribution: distribution as any,
      recentActivity: activity
    };
    return Response.json({ success: true, data: stats });
  }
  private handleGetMessages(): Response {
    return Response.json({ success: true, data: this.state });
  }
  private async handleChatMessage(body: { message: string; model?: string; stream?: boolean }): Promise<Response> {
    const { message, model, stream } = body;
    if (!message?.trim()) {
      return Response.json({ success: false, error: API_RESPONSES.MISSING_MESSAGE }, { status: 400 });
    }
    if (model && model !== this.state.model) {
      this.setState({ ...this.state, model });
      this.chatHandler?.updateModel(model);
    }
    const userMessage = createMessage('user', message.trim());
    this.setState({
      ...this.state,
      messages: [...this.state.messages, userMessage],
      isProcessing: true
    });
    try {
      if (!this.chatHandler) throw new Error('Chat handler not initialized');
      if (stream) {
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = createEncoder();
        (async () => {
          try {
            this.setState({ ...this.state, streamingMessage: '' });
            const response = await this.chatHandler!.processMessage(
              message,
              this.state.messages,
              (chunk: string) => {
                this.setState({
                  ...this.state,
                  streamingMessage: (this.state.streamingMessage || '') + chunk
                });
                writer.write(encoder.encode(chunk));
              }
            );
            const assistantMessage = createMessage('assistant', response.content, response.toolCalls);
            this.setState({
              ...this.state,
              messages: [...this.state.messages, assistantMessage],
              isProcessing: false,
              streamingMessage: ''
            });
          } catch (e) {
            writer.write(encoder.encode('Streaming error.'));
          } finally {
            writer.close();
          }
        })();
        return createStreamResponse(readable);
      }
      const response = await this.chatHandler.processMessage(message, this.state.messages);
      const assistantMessage = createMessage('assistant', response.content, response.toolCalls);
      this.setState({
        ...this.state,
        messages: [...this.state.messages, assistantMessage],
        isProcessing: false
      });
      return Response.json({ success: true, data: this.state });
    } catch (error) {
      this.setState({ ...this.state, isProcessing: false });
      return Response.json({ success: false, error: API_RESPONSES.PROCESSING_ERROR }, { status: 500 });
    }
  }
  private handleClearMessages(): Response {
    this.setState({ ...this.state, messages: [] });
    return Response.json({ success: true, data: this.state });
  }
}