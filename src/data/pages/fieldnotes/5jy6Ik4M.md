---
uid: "5jy6Ik4M"
address: "ML//agent//function calling"
name: "function calling"
date: "2024-03-15"
---
- Structured tool invocation: model outputs a function name + JSON arguments instead of text
- The API routes the call, returns results, model continues generating
- OpenAI, Anthropic, Google all converged on similar formats
- The plumbing that makes [[WA8fVNaT|agents]] actually work in production
