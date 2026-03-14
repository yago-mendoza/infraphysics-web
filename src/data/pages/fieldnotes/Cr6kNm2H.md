---
uid: "Cr6kNm2H"
address: "Cloud//Vercel//Cron Jobs"
name: "Cron Jobs"
date: "2026-03-12"
---
Scheduled [[Vf6kRm2D|Vercel Functions]] that run at fixed intervals. Defined in `vercel.json` with cron syntax.
- Same [[Tm8rBx5K|timeout]] limits as regular Vercel Functions (10s/60s/300s depending on plan)
- Use cases: daily reports, cache warming, periodic API syncs, cleanup tasks
- For recurring batch work (e.g. sync emails every hour, update analytics daily), cron jobs are simpler than [[In7tWs3K|Inngest]]/[[Tr4pDx8L|Trigger.dev]] — no queue infrastructure, just a function on a schedule
- Limitation: if the batch exceeds the timeout, cron jobs have the same problem as regular functions. For heavy batches, combine cron (triggers the job) + Inngest/Trigger.dev (processes the queue).
- Minimum interval: 1 minute (Pro), once per day (Hobby)
