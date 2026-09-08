---
uid: "Kg1BQEh8"
address: "Web Dev//frontend//cookie"
name: "Cookie"
date: "2026-03-15"
---
The browser's native memory. A small file that the browser stores per website and sends automatically with every HTTP request. Your code doesn't control it. Chrome (or Firefox, or Safari) does.
- Every time the [[ISjyfjZ6|frontend]] makes a request to the [[Bk9sTm2J|backend]], cookies travel in the headers. You don't attach them manually. The browser injects them on its own.
- In a [[Sb7tRx5K|Supabase]] app, the cookie holds the session [[KyOPadSs|token]], the one that says "I'm Carmen." It does NOT hold the Gmail token (that lives on the server, in the `profiles` table). Cookies only transport identity, never external service secrets.
- In [[Nx5tWs7J|Next.js]], Supabase's SSR helpers (`@supabase/ssr`) handle reading, writing, and refreshing tokens in cookies automatically. They're the [[w2EGofgI|SDK]]'s framework-specific glue.
- `process.env` has nothing to do with cookies: [[tHKwydrv|environment variables]] live on the server, cookies live in the browser. Separate channels.
