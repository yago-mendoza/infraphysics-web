---
uid: "NnPGeWsu"
address: "Web Dev//deploy//CI/CD//GitHub Actions"
name: "GitHub Actions"
date: "2026-03-14"
---
GitHub's built-in [[Gk6tPm2H|CI/CD]] system. Workflow files live in `.github/workflows/` as YAML. They run on GitHub's servers when triggered.
- Trigger on push, PR, schedule, or manual dispatch. Most common: `on: push: branches: [main]`
- Each workflow has jobs, each job has steps. Steps run shell commands or use pre-built "actions" from the marketplace.
- Typical web deploy flow: `git push` → GitHub Actions triggers → `npm ci` → `npm run build` (generates [[Ht6nWx3K|dist/]]) → deploys dist/ + functions/ to [[Fs8tBm3G|Cloudflare Pages]]
- The deploy pushes **code only** (frontend + API). It does NOT touch the database. [[Wn4pCx7H|D1]] migrations are a separate manual step via [[Nx9sGt5L|Wrangler]].
- Free tier: 2000 minutes/month for private repos, unlimited for public
- Secrets (API keys, tokens) stored in repo settings → available as `${{ secrets.NAME }}` in workflows
