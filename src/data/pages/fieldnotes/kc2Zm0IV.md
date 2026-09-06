---
uid: kc2Zm0IV
address: "ML//agent//ReAct"
name: "ReAct"
date: "2026-02-24"
---
ReAct interleaves reasoning with acting. The model uses current evidence to select a [[mydQy6ia|tool]], observes its result, and revises the next decision instead of committing to an entire plan upfront.

- Its important contribution is not a particular prompt format. It makes external feedback part of inference rather than an afterthought.
- Tool errors and surprising observations become opportunities to update the trajectory, provided the [[HaRn3sA1|harness]] returns them legibly.
- Modern agents often hide or restructure reasoning traces, but the observable control pattern remains: propose, act, inspect, continue.

## Interactions

- [[mydQy6ia|tool use]] : : ReAct formalized how models use tools: interleave reasoning about what to do with actually doing it
