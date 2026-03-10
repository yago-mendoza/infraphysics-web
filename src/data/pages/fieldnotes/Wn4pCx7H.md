---
uid: "Wn4pCx7H"
address: "Cloud//Cloudflare//D1"
name: "D1"
date: "2026-03-10"
---
Cloudflare's managed SQLite database. Runs at the edge, close to your [[Lk2rXj6D|Workers]]. Standard SQL syntax (it's SQLite underneath).
- Two copies: local (for development, via [[Nx9sGt5L|wrangler]]) and remote (production, on [[Hp5nVw9C|Cloudflare]]'s infrastructure)
- Migrations managed via `wrangler d1 migrations`
- Free tier: 5GB storage, 5M rows read/day
- Limitations: single-writer (no concurrent writes from multiple workers), eventually consistent reads from replicas
- Good for: read-heavy apps, personal projects, small-to-medium SaaS
