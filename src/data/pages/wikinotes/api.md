---
slug: api
uid: "Ap8rTm3K"
address: "web dev//API"
name: "API"
date: "2026-03-12"
---
Application Programming Interface. A contract between two pieces of software: "send me this request, I'll give you this response." In web dev, almost always means HTTP endpoints that return JSON.
- [[Ex5rTm9K|External APIs]]: third-party services your app calls via HTTP (Google, Stripe, Sentry, etc.)
- [[Ev3pNx7L|Event-driven APIs]]: your app fires an event, processing happens asynchronously in a job queue
- Internal APIs: your own [[Bk9sTm2J|backend]] endpoints that your [[ISjyfjZ6|frontend]] calls
- In [[Nx5tWs7J|Next.js]], API Routes define your internal API, deployed as [[Vf6kRm2D|Vercel Functions]]
- The intuition against reading pages: instead of looking at the shop and reading the labels, you ask the warehouse directly, "give me product 123 in JSON". That is why an API beats [[baInedI5|scraping]] whenever one exists, and why a [[rpdysn6f|hybrid agent]] reaches for it first.

