---
uid: "Lb5nCx3G"
address: "Infrastructure//AWS//Lambda"
name: "Lambda"
date: "2026-03-12"
---
[[Aw2pDx6F|Amazon]]'s [[Jn4xWp7B|serverless]] functions. The original serverless compute platform (launched 2014). Each invocation spins up a function, executes, and dies.
- Runs inside containers (not [[Vi3tLx8G|V8 isolates]] like [[Lk2rXj6D|Workers]]): heavier, but supports more languages and longer execution times
- [[Cs5nWm7K|Cold starts]] are real: first invocation after idle takes 100ms–1s+ depending on language and bundle size. The container has to boot.
- Execution limit: up to 15 minutes (vs Workers' 30s paid / 5min max)
- [[Vc3pLx8B|Vercel]] Functions are Lambda under the hood: Vercel abstracts the deployment, AWS runs the code
- Pricing: per invocation + per GB-second of compute. Free tier: 1M requests/month

## Interactions
- [[Lk2rXj6D|Workers]] : : Lambda uses containers (heavier, cold starts, 15min max). Workers use V8 isolates (lighter, near-zero cold start, 5min max). Lambda is more capable; Workers is faster to start.
