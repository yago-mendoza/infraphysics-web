---
uid: "tHKwydrv"
address: "Web Dev//environment variable"
name: "Environment Variable"
date: "2026-03-15"
---
A variable that lives outside your code: in the server's environment, not in the source files. Accessed via `process.env.NAME` in [[Wk6jPs2D|Node.js]].
- In local dev: read from `.env.local`. [[Nx5tWs7J|Next.js]] and [[Vp8rBm5J|Vite]] load them automatically on startup.
- In production ([[Vc3pLx8B|Vercel]], [[Fs8tBm3G|Cloudflare Pages]]): configured in the platform dashboard. Same variable names, different values.
- Where [[PkRkL6kd|API keys]] live. The [[Sb7tRx5K|Supabase]] URL, the anon key, the service role key, the Google Client Secret: all in `.env.local`. Never committed to git (`.env.local` is in `.gitignore`).
- `NEXT_PUBLIC_` prefix makes a variable available in the [[ISjyfjZ6|frontend]] bundle. Without the prefix, it's server-only. This is how you put the publishable key in the browser and keep the secret key on the server.
