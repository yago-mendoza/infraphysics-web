---
uid: "Vf6kRm2D"
address: "Cloud//Vercel//Vercel Functions"
name: "Vercel Functions"
date: "2026-03-12"
---
[[Jn4xWp7B|Serverless]] functions on [[Vc3pLx8B|Vercel]]. In a [[Nx5tWs7J|Next.js]] project, these are the API Routes — [[Bk9sTm2J|backend]] code that lives in the same repo as the frontend.
- API Routes in Next.js (`app/api/*/route.ts`) deploy as Vercel Functions automatically
- Run on [[Lb5nCx3G|AWS Lambda]] under the hood — same execution model (container spin-up, [[Cs5nWm7K|cold starts]], per-invocation billing)
- [[Tm8rBx5K|Timeout]]: 10s (Hobby), 60s (Pro), 300s (Enterprise). If a function takes longer, it dies. For heavy batch work (e.g. processing thousands of [[2DTZTKbQ|Gmail]] messages), a single function will timeout — you need a job queue like [[In7tWs3K|Inngest]] or [[Tr4pDx8L|Trigger.dev]] that breaks the work into chunks and processes them sequentially.
- The "backend that lives inside your frontend project" — you define routes in Next.js, Vercel deploys them as serverless functions
- Vercel also offers [[Cr6kNm2H|Cron Jobs]] — scheduled functions that run at fixed intervals (hourly, daily, etc.). Better for recurring batch work than trying to cram everything into one function call.
- Contrast with [[Lk2rXj6D|Workers]]: Vercel Functions are heavier (Lambda containers), slower to start (cold starts), but can run longer and have full [[Wk6jPs2D|Node.js]] access
