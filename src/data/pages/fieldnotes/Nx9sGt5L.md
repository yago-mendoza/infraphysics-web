---
uid: "Nx9sGt5L"
address: "Cloud//Cloudflare//Wrangler"
name: "Wrangler"
date: "2026-03-10"
---
>> 26.03.10 - building a CRM at 2am. wrangler runs all of cloudflare on localhost. frontend, backend, db. i mass years setting up express servers like a peasant. wrangler.toml + npx wrangler dev and you're done.

[[Hp5nVw9C|Cloudflare]]'s CLI tool. The bridge between your machine and Cloudflare: the same code that runs on `localhost:8788` is exactly what will run in production. Nothing to change.
- Manages [[Lk2rXj6D|Workers]], [[Fs8tBm3G|Pages]], [[Wn4pCx7H|D1]], [[Zr6kDj2F|R2]], KV, and all other Cloudflare services from the terminal
- Configuration via `wrangler.toml`. Authenticates via `wrangler login` (OAuth flow).
- Runs via [[Yw7cFx2D|npx]] (`npx wrangler dev`) without global installation
- All backend code is TypeScript: [[Uf7pLs4Q|CRUD]] routes, [[Sv2nKx8R|SQL]] queries to D1, automations (e.g. creating a contact triggers creating its associated story -- all in the same handler)

**Remote (production):**
- `wrangler pages deploy dist` --> uploads [[Ht6nWx3K|dist/]] contents to [[Fs8tBm3G|Pages]]. Cloudflare distributes it to the edge.
- Each request spins up a [[Lk2rXj6D|Worker]]: it's born, executes the backend ([[Xd9kLw4B|Hono]]), responds, and dies ([[Jn4xWp7B|serverless]]). No process running 24/7.
- `wrangler d1 migrations apply --remote` --> applies migrations to the production [[Wn4pCx7H|D1]]

**Local (development):**
- `wrangler pages dev dist` --> simulates Cloudflare on your machine at `localhost:8788`. Acts as a local server like [[Wk6jPs2D|Node.js]]/[[Yg4rVn8L|Express]] would, but running code in an environment that mimics Workers -- same result as production.
- Serves frontend (from `dist/`) + backend (functions/) + local D1, all on one port. No [[Qk4sTn9L|HMR]] for frontend -- serves pre-compiled files.
- Wrangler has HMR for functions (API): change a handler, it reloads. But frontend needs manual rebuild.
- **Two-terminal mode** (recommended for development): Terminal 1: [[Vp8rBm5J|Vite]] (`npm run dev`, port 5173) --> frontend with HMR. Terminal 2: Wrangler (`wrangler pages dev dist`, port 8788) --> API + D1 only. Vite [[Mn3gRp6H|proxies]] `/api/*` to Wrangler. Open `localhost:5173`, not 8788.
- In two-terminal mode, Wrangler doesn't actually need `dist/` (it's not serving frontend), but `wrangler pages dev` requires a directory argument. If `dist/` doesn't exist, an empty `mkdir dist` works fine.
---
## Interactions
- [[Cm5rBw9D|Platform CLI]] : : Wrangler is Cloudflare's platform CLI -- like `vercel` is Vercel's or `netlify` is Netlify's
- [[Rw4sVx7J|Direct Deploy]] : : Wrangler enables direct deploy -- `wrangler pages deploy dist` pushes to production without CI/CD
- [[Qk4sTn9L|HMR]] : : Wrangler has HMR for functions (backend) but NOT for frontend -- serves pre-compiled `dist/`. For frontend HMR you need Vite in a separate terminal
- [[Wk6jPs2D|Node.js]] : : Wrangler locally simulates what a Node.js/Express server would do, but mimicking the Workers runtime instead of Node. Same role (dev server), different execution environment.
