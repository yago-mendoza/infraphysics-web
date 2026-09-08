---
uid: "ActP3rcp"
address: "ML//agent//active perception"
name: "Active Perception"
date: "2026-09-03"
---

A programmer does not read an entire repository before changing one function. They search, inspect the likely file, follow a dependency, run a test, and use the failure to decide what to inspect next. That is active perception: acting in order to choose the next observation.

For an agent, `search`, `read`, and `inspect` are epistemic actions. They reduce uncertainty without directly completing the task. Editing and deploying are world actions. Running tests sits between both categories.

This resembles a partially observable decision process: the real project state is hidden, tools produce observations, and the [[4vDsUzfM|policy]] chooses the next acquisition or intervention.

Dumping the whole repository into the [[JUby2DIy|context window]] removes this useful control loop and can bury the evidence that matters.

## Interactions

- [[Ep1st3mI|epistemic interface]] : : Active perception chooses sequentially which harness-provided view of the environment to request
