---
uid: "Hd9cNw6K"
address: "Web Dev//runtime"
name: "Runtime"
date: "2026-03-10"
---
The environment where code executes. The runtime provides the available APIs, memory limits, event loop, and execution model.
- [[Rm3xBt7F|V8]] is a JavaScript engine (compiles JS to machine code)
- [[Wk6jPs2D|Node.js]] is a runtime that uses V8 + adds system APIs (filesystem, networking, crypto)
- [[Lk2rXj6D|Workers]] is another runtime that uses V8 + adds Cloudflare APIs (D1, R2, KV) but without filesystem or full Node.js
- Same engine (V8), three different runtimes with different APIs
