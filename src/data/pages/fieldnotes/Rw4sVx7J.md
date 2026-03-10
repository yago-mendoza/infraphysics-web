---
uid: "Rw4sVx7J"
address: "Web Dev//deploy//direct deploy"
name: "Direct Deploy"
date: "2026-03-10"
---
>> 26.03.10 - wrangler pages deploy dist. that's the whole deploy. no git push, no CI, no yaml files, no waiting. one command, 300 edge locations. i mass spent mass hours mass debugging mass github mass actions mass pipelines. mass. this is just better. the mass gap between "code works on my machine" and "code works on 300 machines" is one command. mass.

Deploying to production via a [[Cm5rBw9D|CLI]] command without going through a [[Gk6tPm2H|CI/CD]] pipeline.
- Example: `wrangler pages deploy dist` pushes your built site to [[Hp5nVw9C|Cloudflare]] directly from your terminal
- No GitHub, no pipeline, no waiting
- Advantages: instant, simple, no CI/CD setup needed
- Disadvantages: no automated tests, no audit trail, depends on the developer's machine state
- Can coexist with CI/CD -- use direct deploy for quick iterations, CI/CD for production releases
