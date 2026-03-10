---
uid: "Xd9kLw4B"
address: "Web Dev//framework//Hono"
name: "Hono"
date: "2026-03-10"
---
Lightweight web framework designed for [[Tm6yRs2K|edge]] runtimes. Similar to Express but for [[Jn4xWp7B|serverless]] environments where there's no full Node.js.
- Runs on [[Lk2rXj6D|Cloudflare Workers]], Deno, Bun, and also Node.js
- Familiar API: `app.get('/api/users', handler)`, `app.post('/api/users', handler)`
- In the Cloudflare stack: Hono lives in `functions/api/`, [[Nx9sGt5L|Wrangler]] executes it as a Worker, handling `/api/*` routes
- Serves both frontend (static files) and backend (API + logic) -- in production both travel through the same [[Lk2rXj6D|Worker]]
---
## Interactions
- [[Lk2rXj6D|Workers]] : : Hono runs on Workers -- it's the framework, Workers is the runtime. As Express is to Node, Hono is to Workers
