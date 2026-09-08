---
uid: "Ev3pNx7L"
address: "Web Dev//API//event-driven API"
name: "Event-driven API"
date: "2026-03-12"
---
Pattern where your app fires an event and the actual processing happens outside your request. Your [[Vf6kRm2D|Vercel Function]] returns immediately; the heavy work runs asynchronously in a job queue.
- Your app sends an event ("emails.sync_requested", "report.generate") → [[In7tWs3K|Inngest]] or [[Tr4pDx8L|Trigger.dev]] picks it up → processes it in background steps, each within the [[Tm8rBx5K|timeout]]
- The user's request doesn't hang waiting for the work to finish. The frontend can poll for status or receive a webhook when done.
- Each step is its own function invocation: step 1 fetches emails, step 2 parses them, step 3 saves to DB. If step 2 fails, only step 2 retries.
- Solves the [[Tm8rBx5K|timeout]] problem: instead of one 10-minute function that gets killed, you have 100 six-second functions that each complete within budget.
- The [[Ex5rTm9K|external API]] calls still happen, but inside Inngest/Trigger.dev steps, not inside your user-facing request handler.
- Use when: batch processing ([[2DTZTKbQ|Gmail]] sync, data migration), multi-step workflows, anything that exceeds a single function's timeout
