---
uid: "Jn4xWp7B"
address: "Cloud//serverless"
name: "Serverless"
date: "2026-03-10"
---
>> 26.03.10 - let's build intuition for what serverless actually means. there is no server. there is no process listening on a port. when a request arrives, a function spins up, executes your handler, returns a response, and is destroyed. that's it. the mental model shift is: you don't run software, you define what should happen when something happens. cloud provider handles the rest. this is surprisingly hard to internalize if you grew up with express.listen(3000).

Execution model where the cloud provider runs your code on demand, per request, without you managing servers. No process running 24/7. You deploy functions, the provider handles scaling, routing, and lifecycle. You pay per invocation, not per hour.
- Cold starts are the main tradeoff -- first request after idle may be slower
- Examples: AWS Lambda, [[Lk2rXj6D|Cloudflare Workers]], Vercel Edge Functions, Google Cloud Functions
- Contrast with traditional hosting where a Node/Express process runs continuously
---
## Interactions
- [[Tm6yRs2K|Edge Computing]] : : edge functions are serverless -- they execute per request and die after. The "edge" part is about *where*, the "serverless" part is about *how*
