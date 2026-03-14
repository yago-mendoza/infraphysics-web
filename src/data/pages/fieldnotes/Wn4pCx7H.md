---
uid: "Wn4pCx7H"
address: "Cloud//Cloudflare//D1"
name: "D1"
date: "2026-03-10"
---
Cloudflare's managed SQLite database. Runs at the edge, close to your [[Lk2rXj6D|Workers]]. Standard SQL syntax (it's SQLite underneath).
- Two copies: local (for development, via [[Nx9sGt5L|wrangler]]) and remote (production, on [[Hp5nVw9C|Cloudflare]]'s infrastructure)
- Migrations: `npx wrangler d1 migrations apply --local` (dev) or `--remote` (prod). Generates a `schema.ts` that you apply to each DB independently.
- **Push** (local → remote): `npx wrangler d1 export --local --output dump.sql` then `npx wrangler d1 execute --remote --file dump.sql`. The `dump.sql` is just a transport file — like a pendrive. Extract from one side, inject into the other, delete the file.
- **Pull** (remote → local): `npx wrangler d1 export --remote --output dump.sql` then `npx wrangler d1 execute --local --file dump.sql`
- Code deploys ([[NnPGeWsu|GitHub Actions]] or `wrangler pages deploy`) push frontend + API only. They do NOT touch D1. The database lives on [[Hp5nVw9C|Cloudflare]] separately — GitHub doesn't know it exists. `.wrangler/` (local DB) is in `.gitignore`.
- Free tier: 5GB storage, 5M rows read/day
- Limitations: single-writer (no concurrent writes from multiple workers), eventually consistent reads from replicas
- Good for: read-heavy apps, personal projects, small-to-medium SaaS
