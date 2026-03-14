---
uid: "In7tWs3K"
address: "Cloud//Vercel//Inngest"
name: "Inngest"
date: "2026-03-12"
---
Job queue and workflow engine that integrates natively with [[Vc3pLx8B|Vercel]]. Solves the [[Tm8rBx5K|timeout]] problem: instead of one long function, you define a series of steps that Inngest orchestrates.
- Each step runs as a separate [[Vf6kRm2D|Vercel Function]] invocation — each one gets its own timeout budget
- Inngest manages the queue: retries on failure, tracks progress, handles concurrency limits
- Use case: processing a batch of 5,000 [[2DTZTKbQ|Gmail]] messages. One function would timeout. Inngest breaks it into 5,000 small steps, processes them sequentially or in parallel, retries failures.
- Event-driven: you send an event ("user.signed_up", "batch.requested"), Inngest triggers the right function chain
- Runs on your existing [[Jn4xWp7B|serverless]] infrastructure — no separate server to manage
---
## Interactions
- [[Tr4pDx8L|Trigger.dev]] : : both solve the same problem (long-running work on serverless) with job queues. Inngest is event-driven and more opinionated; Trigger.dev is closer to traditional background jobs with more control over execution.
