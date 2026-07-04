---
uid: "bNGmRCsR"
address: "ML//Training"
name: "Training"
date: "2026-02-15"
---
The pipeline that takes a raw model from "predicts text" to "follows instructions" to "aligns with human values".
- Rough evolution: [[2oNdlB5L|pre-training]] → [[qcqxPFA0|SFT]] → [[0f5GJDwc|RLHF]]/[[YwfNaR4R|DPO]]
- Data format is algorithm-agnostic: same (prompt, chosen, rejected) triplets feed [[YwfNaR4R|DPO]], [[rxVjxTLA|PPO]], [[HRgl17gQ|GRPO]]. The difference is [[Op3pJ7mS|on-policy vs off-policy]] consumption.
- Catastrophic forgetting is real. Training only on new data overwrites old knowledge; solution: replay buffers, mixing a % of old data during new training.
- Taxonomic annotation (labeling) is a data enrichment step that can feed into any method: SFT training pairs, constitution enhancement for DPO, pre-training data, or [[yK3RLt0K|RAG]]

## Interactions

- [[rxVjxTLA]] : : On-policy reward optimization, faster but worse credit assignment
