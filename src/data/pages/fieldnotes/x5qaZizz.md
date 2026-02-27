---
uid: "x5qaZizz"
address: "ML//Mixture of Experts"
name: "Mixture of Experts"
date: "2026-02-26"
aliases: ["MoE"]
---
- Route each token to a subset of "expert" [[Pr8dt3wz|feed-forward]] blocks instead of using all parameters
- Total param count is huge, active params per token are small — cheaper inference at frontier scale
- Mixtral ([[xd1c1Ru9|Mistral]]): 8×7B experts, 2 active → 47B total, 13B active. [[nUKlfmSO|DeepSeek]] V3: 256 experts
- Now the dominant architecture for frontier-scale models. Dense is becoming the exception
---
[[Pr8dt3wz|feed-forward network]] :: MoE replaces the single FFN per layer with multiple routed experts — same position in the transformer block, parallel execution
