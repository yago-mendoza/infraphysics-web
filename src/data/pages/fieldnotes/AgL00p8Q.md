---
uid: "AgL00p8Q"
address: "ML//agent//agent loop"
name: "Agent Loop"
date: "2026-09-04"
---

The agent loop repeatedly assembles context, asks a model for the next action, executes or rejects that action, records the observation and decides whether another iteration is warranted.

Its source code can be tiny. Its policy surface is not. Timeouts, retry rules, budgets, validation, compaction, permissions and termination conditions all change which trajectories remain possible. A loop that continues after every error creates a different agent from one that returns control immediately, even with the same prompt and model.

The loop is the heartbeat. The surrounding rules decide what kind of organism gets a pulse.

## Interactions

- [[HaRn3sA1|agent harness]] : : The harness implements the loop and owns the durable state reconstructed between model calls
- [[Aut0n0my|agent autonomy]] : : Iteration limits and stopping rules turn autonomy into a concrete execution budget

