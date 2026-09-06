---
uid: "ObjFun6c"
address: "ML//agent//objective"
name: "Agent Objective"
date: "2026-09-04"
---

An objective describes what an agent is trying to make true. In deployed agents it is usually distributed across user instructions, system policy, acceptance tests, reward signals and stopping criteria rather than written as one clean mathematical function.

That fragmentation creates room for disagreement. “Fix the bug” may conflict with “do not modify public behavior”, while a test suite may reward a patch that satisfies examples but violates the intended contract. The effective objective is whatever the whole system makes advantageous or acceptable, not merely the sentence the designer remembers writing.

A precise score can still be a poor specification.

## Interactions

- [[SpcGam3Q|specification gaming]] : : A proxy objective creates shortcuts that satisfy the measured criterion while betraying the intended outcome
- [[InsBeh4V|instrumental behavior]] : : Objectives induce intermediate actions whose desirability comes only from helping reach the final state
