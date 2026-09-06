---
uid: "EvHarn6S"
address: "ML//agent//evaluation harness"
name: "Evaluation Harness"
date: "2026-09-04"
---

An evaluation harness is the machinery that presents tasks, provisions environments, exposes tools, enforces limits and computes scores. For agents, it is part examiner, part laboratory and part operating environment.

That means an agent score never belongs cleanly to the model. CPU, memory, timeouts, network policy, tool ergonomics and scoring bugs can all change measured performance. A suspicious trajectory may reveal model behavior, harness behavior or an interaction between both.

If the laboratory changes the phenomenon, “same test” is only a label.

## Interactions

- [[HaRn3sA1|agent harness]] : : An evaluation harness is a task-specific harness whose outputs are used to make capability claims
- [[d6uchFbH|benchmark]] : : The benchmark defines tasks and metrics; the evaluation harness determines how those tasks physically occur
