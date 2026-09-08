---
uid: "Tm8rBx5K"
address: "Infrastructure//timeout"
name: "timeout"
date: "2026-03-12"
---
The maximum time a [[Jn4xWp7B|serverless]] function is allowed to run before the platform kills it. If the function hasn't responded by then, it dies: no graceful shutdown, no retry.
- [[Vf6kRm2D|Vercel Functions]]: 10s (Hobby), 60s (Pro), 300s (Enterprise)
- [[Lk2rXj6D|Cloudflare Workers]]: tied to [[Ct7rBn4D|CPU time]], not wall time: 10ms (free), 30s (paid), 5min max
- [[Lb5nCx3G|AWS Lambda]]: up to 15 minutes
- The timeout is why you can't run heavy batch processing (e.g. scanning thousands of [[2DTZTKbQ|emails]]) in a single serverless function. It'll get killed mid-work
- Solution: job queues like [[In7tWs3K|Inngest]] or [[Tr4pDx8L|Trigger.dev]] that break work into small chunks, each within the timeout. Or [[Cr6kNm2H|Vercel Cron Jobs]] for recurring scheduled work.
- Timeouts exist because [[Jn4xWp7B|serverless]] platforms bill per execution time and share resources: letting one function run forever would starve others and rack up costs
