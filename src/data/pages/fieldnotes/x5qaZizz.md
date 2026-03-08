---
uid: "x5qaZizz"
address: "ML//Mixture of Experts"
name: "Mixture of Experts"
date: "2026-03-01"
aliases: ["MoE"]
---
Instead of 1 [[Pr8dt3wz|MLP]] per layer, have N MLPs ("experts") and a router that activates only K of them per token.
- Total param count is huge, active params per token are small — cheaper inference at frontier scale.
- Mixtral ([[xd1c1Ru9|Mistral]]): 8×7B experts, 2 active → 47B total, 13B active. [[nUKlfmSO|DeepSeek]] V3: 256 experts. GPT-4 uses MoE.
- More parameters total, same computational cost per token — the scaling trick for frontier models.
- Now the dominant architecture for frontier-scale models. Dense is becoming the exception.

## Interactions

- [[Pr8dt3wz|feed-forward network]] : : MoE replaces the single FFN per layer with multiple routed experts — same position in the transformer block, parallel execution
