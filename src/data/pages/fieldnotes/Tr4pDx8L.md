---
uid: "Tr4pDx8L"
address: "Cloud//Vercel//Trigger.dev"
name: "Trigger.dev"
date: "2026-03-12"
---
Background job framework that integrates with [[Vc3pLx8B|Vercel]] and other [[Jn4xWp7B|serverless]] platforms. Like [[In7tWs3K|Inngest]], it solves the [[Tm8rBx5K|timeout]] problem by breaking work into queued jobs.
- Define jobs in TypeScript: each job is a function that gets queued, executed, and tracked
- Built-in retry logic, concurrency control, and progress tracking
- Dashboard for monitoring: see which jobs are running, failed, or completed
- Use case: same as Inngest, batch processing, API integrations, data pipelines, anything that would [[Tm8rBx5K|timeout]] in a single [[Vf6kRm2D|Vercel Function]]
- More explicit than Inngest: you define jobs and triggers directly, less magic, more control over scheduling and execution order
