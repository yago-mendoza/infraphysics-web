---
uid: "Sh7kM3nQ"
address: "ML//Training//Safe RLHF"
name: "Safe RLHF"
date: "2026-03-01"
---
Decouples helpfulness and harmlessness into **separate annotation streams**: human annotators score each axis independently.
- Standard [[0f5GJDwc|RLHF]] conflates both: "is this response good?" becomes ambiguous when a helpful response is slightly unsafe or a safe response is useless.
- Two separate [[83orykQl|reward models]] (one for helpfulness, one for harmlessness) trained on their own preference data.
- During [[rxVjxTLA|PPO]], both rewards are combined with a controllable tradeoff coefficient: you can dial safety up or down.
- Key insight: the Pareto frontier between helpfulness and harmlessness is NOT a fixed tradeoff. With better data and separate optimization, you can push both upward simultaneously.

## Interactions

- [[0f5GJDwc|RLHF]] : : Safe RLHF decomposes the monolithic "human preference" signal into orthogonal axes: helpfulness and harmlessness get their own annotation pipelines
- [[83orykQl|RM]] : : Instead of one reward model, Safe RLHF trains two: each specialized for one axis, avoiding the conflation that makes standard RMs unreliable on safety-critical outputs
- [[3EKErev3|Alignment]] : : Safe RLHF makes the safety-capability tradeoff explicit and tunable: no more hoping the model "just gets it right"
