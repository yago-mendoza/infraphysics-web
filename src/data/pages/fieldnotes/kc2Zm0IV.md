---
uid: "kc2Zm0IV"
address: "ML//agent//ReAct"
name: "ReAct"
date: "2026-02-26"
---
- Reasoning + Acting: the model alternates between thinking (reasoning traces) and acting ([[mydQy6ia|tool]] calls)
- Loop: "Thought → Action → Observation → Thought → ..." until the task is solved
- The paper that started the tool-using LLM paradigm. Led to [[5jy6Ik4M|function calling]], Gorilla, BFCL leaderboard
- Simple but effective. Most modern agent frameworks implement variations of ReAct
---
[[mydQy6ia|tool use]] :: ReAct formalized how models use tools — interleave reasoning about what to do with actually doing it
