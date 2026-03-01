# Cloudflare Agents AI Chat Template

[![Deploy to Cloudflare][![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mikeschlottig/orbital-file-command-ai-powered-file-system-admin)]

A production-ready AI agent chatbot template powered by **Cloudflare Agents SDK**. Features intelligent tool calling via **Model Context Protocol (MCP)**, multi-model support, persistent conversations with Durable Objects, and a modern React frontend.

## 🚀 Features

- **Cloudflare Agents SDK** - Stateful agents with Durable Objects for conversation persistence
- **Real MCP Integration** - Connects to production Cloudflare MCP servers (D1, R2, Workers KV, Observability)
- **Multi-Model Support** - Gemini 2.0/2.5, GPT-4o, Claude Opus (via Cloudflare AI Gateway)
- **Intelligent Tool Usage** - Automatic tool detection and execution (weather, web search, database queries)
- **Session Management** - Control plane Durable Object for multi-session chat
- **Real-time Streaming** - Server-sent events for instant responses
- **Modern UI** - React + Tailwind + Shadcn/UI + Framer Motion animations
- **Production Ready** - TypeScript, error handling, observability, SPA routing

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite 6, Tailwind CSS 3.4, Shadcn/UI, Framer Motion
- **Backend**: Cloudflare Workers, Hono, Cloudflare Agents SDK 0.0.109
- **AI/ML**: OpenAI SDK 5.x, Model Context Protocol (MCP) TypeScript SDK 1.16+
- **Storage**: Durable Objects, D1, R2 (via MCP servers)
- **Dev Tools**: Bun, Wrangler, ESLint, TypeScript 5.8

## ⚡ Quick Start

1. **Clone & Install**
   ```bash
   git clone <your-repo>
   cd <your-repo>
   bun install
   ```

2. **Configure Environment** (in `wrangler.jsonc`)
   ```json
   {
     "vars": {
       "CF_AI_BASE_URL": "https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai",
       "CF_AI_API_KEY": "your-cloudflare-api-key"
     }
   }
   ```

3. **Development**
   ```bash
   bun dev  # Frontend + Worker on localhost:3000
   ```

4. **Deploy**
   ```bash
   bun run deploy
   ```

Your app will be live at `https://your-worker.your-subdomain.workers.dev`!

## 🧪 Local Development

### Frontend
```
bun run dev  # http://localhost:3000
```

### Worker API
```
wrangler dev  # API endpoints available at http://localhost:8787
```

### Key Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/:sessionId/chat` | `POST` | Send message (supports streaming) |
| `/api/chat/:sessionId/messages` | `GET` | Get conversation history |
| `/api/chat/:sessionId/clear` | `DELETE` | Clear conversation |
| `/api/sessions` | `POST` | Create new session |
| `/api/sessions` | `GET` | List sessions |
| `/api/sessions/:id` | `DELETE` | Delete session |

### Session Management
```typescript
// Create session
const { data } = await fetch('/api/sessions', {
  method: 'POST',
  body: JSON.stringify({ firstMessage: 'Hello!' })
});

// Chat
await fetch(`/api/chat/${sessionId}/chat`, {
  method: 'POST',
  body: JSON.stringify({ message: 'Hi!', stream: true })
});
```

## 🚀 Deployment

Deploy to Cloudflare Workers in one command:

```bash
bun run deploy
```

[![Deploy to Cloudflare][![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mikeschlottig/orbital-file-command-ai-powered-file-system-admin)]

### Prerequisites
1. **Cloudflare Account** - Free tier supported
2. **Wrangler CLI** - Installed via Bun
3. **AI Gateway** - Setup at [dash.cloudflare.com](https://dash.cloudflare.com)
4. **Environment Variables**:
   - `CF_AI_BASE_URL`: Your AI Gateway URL
   - `CF_AI_API_KEY`: Cloudflare API Token

### Post-Deployment
- **Custom Domain**: Add via Wrangler or Cloudflare dashboard
- **Durable Objects**: Auto-migrated on first deploy
- **Assets**: Static files served from Workers

## 🔧 Customization

### Add MCP Servers
Edit `worker/mcp-client.ts`:
```typescript
const MCP_SERVERS = [
  { name: 'd1', sseUrl: 'https://your-mcp-server.com/sse' }
];
```

### Custom Tools
Extend `worker/tools.ts`:
```typescript
case 'your-tool': 
  return await yourToolLogic(args);
```

### New UI Pages
Add to `src/main.tsx`:
```typescript
{ path: "/dashboard", element: <Dashboard /> }
```

### Themes
Uses `next-themes` - Toggle via `useTheme()` hook.

## 📚 MCP Integration

**Cloudflare MCP Servers** pre-configured:
- **D1**: Database queries
- **R2**: Object storage operations
- **Workers**: Invocation & analytics
- **Observability**: Metrics & traces

Tools auto-discovered via MCP `listTools()`.

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `Missing CF_AI_API_KEY` | Configure in `wrangler.jsonc` |
| `MCP connection failed` | Check SSE endpoints in `mcp-client.ts` |
| `Build fails` | `bun install && bun run cf-typegen` |
| `Hot reload issues` | Clear caches: `rm -f .eslintcache tsconfig.tsbuildinfo` |

## 🔒 Security & Limits

⚠️ **AI Request Limits**: Shared quota across users. Monitor via Cloudflare dashboard.

## 📄 License

MIT License. See [LICENSE](/LICENSE) for details.

## 🤝 Contributing

1. Fork & clone
2. `bun install`
3. `bun dev`
4. Submit PR to `main`

Questions? Open an issue!

---

⭐ **Made with [Cloudflare Agents](https://developers.cloudflare.com/agents/) + ❤️ by Cloudflare Workers Templates**