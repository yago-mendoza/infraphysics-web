---
uid: "Rm3xBt7F"
address: "Web Dev//runtime//V8"
name: "V8"
date: "2026-03-10"
---
JavaScript engine developed by Google. Compiles JS/TypeScript to machine code and executes it. The heart of Chrome, [[Wk6jPs2D|Node.js]], and [[Lk2rXj6D|Cloudflare Workers]].
- In the browser: V8 runs the frontend JS (the `dist/` that [[Vp8rBm5J|Vite]] produces)
- In Node.js: V8 + system APIs (filesystem, HTTP, streams) --> backend server
- In Workers: V8 + Cloudflare APIs (D1, R2, KV) --> edge functions
- Same engine, different [[Hd9cNw6K|runtimes]]: JS executes the same way, but the available APIs change

## Interactions
- [[Lk2rXj6D|Workers]] : : Workers use V8 isolates (not Node.js) -- they start in ~0ms because each request is a lightweight isolate, not a full process
- [[Wk6jPs2D|Node.js]] : : Node.js packages V8 with system APIs (fs, http, crypto). Workers packages V8 with Cloudflare APIs. Same engine, different runtime.
