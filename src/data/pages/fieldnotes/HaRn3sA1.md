---
uid: "HaRn3sA1"
address: "ML//agent//harness"
name: "Agent Harness"
date: "2026-09-03"
---

An LLM can emit text or a structured [[5jy6Ik4M|function call]]. It cannot open a file, retain durable state, or deploy software by itself. The agent harness is the ordinary software that turns those generations into a process acting on an environment.

It assembles context, exposes tools, validates calls, enforces permissions, executes implementations, serializes observations, handles failure, and starts the next inference. The model proposes a transition; the harness decides whether and how that transition becomes real.

This is wider than a system prompt and narrower than the whole product. A prompt supplies information. An [[Ap8rTm3K|API]] supplies operations. The harness owns the loop connecting inference, operations, state, and policy enforcement.

The model is not the agent's operating system. The harness is.

## Interactions

- [[WA8fVNaT|agent]] : : An agent emerges from a model operating inside a harness loop, not from the model in isolation
- [[AgCnt9Zm|agent containment]] : : The harness must enforce what model proposals are allowed to become real
