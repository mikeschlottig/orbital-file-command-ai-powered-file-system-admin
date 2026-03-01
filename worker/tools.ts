import type { ErrorResult } from './types';
import { mcpManager } from './mcp-client';
export type ToolResult = { content: string } | ErrorResult | any;
const fsTools = [
  {
    type: 'function' as const,
    function: {
      name: 'query_files',
      description: 'Search for files using SQL filters. Use name, path, type, or size.',
      parameters: {
        type: 'object',
        properties: {
          filter: { type: 'string', description: 'SQL WHERE clause fragment (e.g., "size > 1000000 AND type = \'pdf\'")' }
        }
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'move_files',
      description: 'Change the path of files matching a criteria.',
      parameters: {
        type: 'object',
        properties: {
          target_path: { type: 'string' },
          filter: { type: 'string', description: 'SQL WHERE clause' }
        },
        required: ['target_path', 'filter']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'tag_files',
      description: 'Apply a tag to files matching a criteria.',
      parameters: {
        type: 'object',
        properties: {
          tag_name: { type: 'string' },
          filter: { type: 'string', description: 'SQL WHERE clause' }
        },
        required: ['tag_name', 'filter']
      }
    }
  }
];
export async function getToolDefinitions() {
  const mcpTools = await mcpManager.getToolDefinitions();
  return [...fsTools, ...mcpTools];
}
export async function executeTool(name: string, args: Record<string, unknown>, sql: SqlStorage): Promise<ToolResult> {
  try {
    switch (name) {
      case 'query_files': {
        const filter = args.filter ? `WHERE ${args.filter}` : '';
        const results = sql.exec(`SELECT * FROM Files ${filter} LIMIT 10`).toArray();
        return { count: results.length, files: results };
      }
      case 'move_files': {
        const target = args.target_path as string;
        const filter = args.filter as string;
        const result = sql.exec(`UPDATE Files SET path = ?, updated_at = CURRENT_TIMESTAMP WHERE ${filter}`, target);
        sql.exec(`INSERT INTO Actions (id, type, description, status) VALUES (?, 'MOVE', ?, 'success')`, 
          crypto.randomUUID(), `Moved files to ${target} where ${filter}`);
        return { success: true, message: `Files moved to ${target}` };
      }
      case 'tag_files': {
        const tagName = args.tag_name as string;
        const filter = args.filter as string;
        // Ensure tag exists
        sql.exec(`INSERT OR IGNORE INTO Tags (id, name) VALUES (?, ?)`, crypto.randomUUID(), tagName);
        const tag = sql.exec(`SELECT id FROM Tags WHERE name = ?`, tagName).one() as any;
        // Link matching files
        const fileIds = sql.exec(`SELECT id FROM Files WHERE ${filter}`).toArray().map(f => (f as any).id);
        for (const fid of fileIds) {
          sql.exec(`INSERT OR IGNORE INTO FileTags (file_id, tag_id) VALUES (?, ?)`, fid, tag.id);
        }
        sql.exec(`INSERT INTO Actions (id, type, description, status) VALUES (?, 'TAG', ?, 'success')`, 
          crypto.randomUUID(), `Tagged files with ${tagName} where ${filter}`);
        return { success: true, message: `Applied tag ${tagName} to ${fileIds.length} files` };
      }
      default: {
        return await mcpManager.executeTool(name, args);
      }
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Tool error' };
  }
}