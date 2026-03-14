---
uid: "Vc3pLx8B"
address: "Cloud//Vercel"
name: "Vercel"
date: "2026-03-12"
---
Cloud platform for deploying web applications. Created by the same team behind [[Nx5tWs7J|Next.js]] — the platform and the framework are designed to work together.
- Deploys frontend (static + SSR) and [[Bk9sTm2J|backend]] ([[Vf6kRm2D|Vercel Functions]]) from the same project
- Under the hood, functions run on [[Lb5nCx3G|AWS Lambda]] — container-based, with [[Cs5nWm7K|cold starts]] but longer execution times than [[Lk2rXj6D|Workers]]
- Better suited for full-stack apps that need heavy backend logic, [[Pg6tRw2H|PostgreSQL]] with [[Pv3kBx9D|pgvector]], or long-running computations
- Integrates natively with [[Ne3pWm6D|Neon]] and [[Sb7tRx5K|Supabase]] for database
---
## Interactions
- [[Hp5nVw9C|Cloudflare]] : : Cloudflare is edge-first (fast, lightweight, limited compute). Vercel is Lambda-based (heavier, more flexible, cold starts). For content sites, Cloudflare. For full-stack apps with heavy backend, Vercel.
