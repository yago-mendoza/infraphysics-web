---
uid: "Bk9sTm2J"
address: "Web Dev//backend"
name: "Backend"
date: "2026-03-12"
---
Code that runs on a server, not in the browser. If it runs in the browser, it's [[ISjyfjZ6|frontend]], regardless of the language. What makes it "backend" is where it executes, not what language it's written in.
- Typical responsibilities: API endpoints, database queries, authentication, business logic, file processing
- Traditional: a [[Wk6jPs2D|Node.js]]/[[Yg4rVn8L|Express]] process running 24/7 on a server, connected to [[Pg6tRw2H|PostgreSQL]] or another database
- [[Jn4xWp7B|Serverless]]: functions that spin up per request ([[Lb5nCx3G|Lambda]], [[Lk2rXj6D|Workers]], [[Vf6kRm2D|Vercel Functions]])
- In [[Nx5tWs7J|Next.js]], frontend and backend live in the same project. API Routes are backend code deployed as serverless functions. The full stack in one repo.
- In a [[Vp8rBm5J|Vite]] + [[Rc4pBn9L|React]] project (like InfraPhysics), there's no backend. Content compiles to static files at build time. [[Fs8tBm3G|Cloudflare Pages]] serves them. The only server-side logic is an edge function injecting OpenGraph meta tags for crawlers.
- The backend is where you connect to [[Pg6tRw2H|PostgreSQL]], [[Pc7sTm2K|Pinecone]], [[Sb7tRx5K|Supabase]], whatever data layer you need. The frontend calls the backend's API.
---
## Interactions
- [[ISjyfjZ6|frontend]] : : frontend runs in the browser, backend runs on the server. Same language (JavaScript) can do both. What matters is where it executes, not what it's written in.
