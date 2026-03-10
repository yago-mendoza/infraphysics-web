---
uid: "Wk6jPs2D"
address: "Web Dev//runtime//Node.js"
name: "Node.js"
date: "2026-03-10"
---
JavaScript runtime for servers. Uses [[Rm3xBt7F|V8]] as the engine + adds APIs that don't exist in the browser: filesystem, networking, crypto, child processes.
- A Node.js process runs 24/7 waiting for requests (traditional server model)
- [[Yw7cFx2D|npx]] and npm are Node.js ecosystem tools
- [[Yg4rVn8L|Express]] is the most popular web framework for Node.js
- Contrast with [[Lk2rXj6D|Workers]]: Node.js is a persistent process with system access; Workers are ephemeral functions with cloud service access
- [[Nx9sGt5L|Wrangler]] locally simulates what a Node.js/Express server would do, but runs code in an environment that mimics [[Hp5nVw9C|Cloudflare]] -- same code, same result, without Node as the server
