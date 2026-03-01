import { DurableObject } from 'cloudflare:workers';
import type { SessionInfo, GlobalStats } from './types';
import type { Env } from './core-utils';
export class AppController extends DurableObject<Env> {
  private sessions = new Map<string, SessionInfo>();
  private nodeStats = new Map<string, { files: number; size: number }>();
  private loaded = false;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      const stored = await this.ctx.storage.get<Record<string, SessionInfo>>('sessions') || {};
      const stats = await this.ctx.storage.get<Record<string, { files: number; size: number }>>('nodeStats') || {};
      this.sessions = new Map(Object.entries(stored));
      this.nodeStats = new Map(Object.entries(stats));
      this.loaded = true;
    }
  }
  private async persist(): Promise<void> {
    await this.ctx.storage.put('sessions', Object.fromEntries(this.sessions));
    await this.ctx.storage.put('nodeStats', Object.fromEntries(this.nodeStats));
  }
  async addSession(sessionId: string, title?: string): Promise<void> {
    await this.ensureLoaded();
    const now = Date.now();
    this.sessions.set(sessionId, {
      id: sessionId,
      title: title || `Chat ${new Date(now).toLocaleDateString()}`,
      createdAt: now,
      lastActive: now
    });
    await this.persist();
  }
  async reportStats(sessionId: string, files: number, size: number): Promise<void> {
    await this.ensureLoaded();
    this.nodeStats.set(sessionId, { files, size });
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
    }
    await this.persist();
  }
  async removeSession(sessionId: string): Promise<boolean> {
    await this.ensureLoaded();
    this.nodeStats.delete(sessionId);
    const deleted = this.sessions.delete(sessionId);
    if (deleted) await this.persist();
    return deleted;
  }
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
      await this.persist();
    }
  }
  async listSessions(): Promise<SessionInfo[]> {
    await this.ensureLoaded();
    return Array.from(this.sessions.values()).sort((a, b) => b.lastActive - a.lastActive);
  }
  async getGlobalStats(): Promise<GlobalStats> {
    await this.ensureLoaded();
    let totalFiles = 0;
    let totalSize = 0;
    for (const s of this.nodeStats.values()) {
      totalFiles += s.files;
      totalSize += s.size;
    }
    return {
      totalSessions: this.sessions.size,
      totalRecordsEstimate: totalFiles,
      systemLoad: Math.min(100, Math.floor((this.sessions.size * 5) + (totalFiles / 100)))
    };
  }
  async removeStats(sessionId: string): Promise<void> {
    await this.ensureLoaded();
    this.nodeStats.delete(sessionId);
    await this.persist();
  }
  async getSessionCount(): Promise<number> {
    await this.ensureLoaded();
    return this.sessions.size;
  }
}