---
uid: "Yg4rVn8L"
address: "Web Dev//framework//Express"
name: "Express"
date: "2026-03-10"
---
Web framework for [[Wk6jPs2D|Node.js]]. The de facto standard for building APIs and HTTP servers with server-side JavaScript.
- API: `app.get('/users', handler)`, `app.post('/users', handler)` -- define routes and handlers
- Middleware: functions that process the request before it reaches the handler (auth, logging, parsing)
- Runs on Node.js -- requires a persistent process (a server running 24/7)

## Interactions
- [[Xd9kLw4B|Hono]] : : Express is to Node.js what Hono is to Workers. Same idea (routes + handlers framework), different runtime. Express needs a persistent server; Hono runs [[Jn4xWp7B|serverless]] at the edge.
