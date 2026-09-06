---
uid: "bNGmRCsR"
address: "ML//Training"
name: "Training"
date: "2026-02-15"
---
Training adjusts model parameters to reduce an objective over examples or interactions. For modern language models it may include [[2oNdlB5L|pre-training]], instruction-focused [[qcqxPFA0|SFT]] and preference or reward optimization through methods such as [[0f5GJDwc|RLHF]] and [[YwfNaR4R|DPO]].

Training spends large amounts of compute to create or modify the reusable weights. Inference then amortizes that investment across many outputs. The split is economically important: an organization may tolerate an expensive training run while requiring every future token to be cheap.

- Rough evolution: [[2oNdlB5L|pre-training]] → [[qcqxPFA0|SFT]] → [[0f5GJDwc|RLHF]]/[[YwfNaR4R|DPO]]
- Data format is algorithm-agnostic: same (prompt, chosen, rejected) triplets feed [[YwfNaR4R|DPO]], [[rxVjxTLA|PPO]], [[HRgl17gQ|GRPO]]. The difference is [[Op3pJ7mS|on-policy vs off-policy]] consumption.
- Catastrophic forgetting is real. Training only on new data overwrites old knowledge; solution: replay buffers, mixing a % of old data during new training.
- Taxonomic annotation (labeling) is a data enrichment step that can feed into any method: SFT training pairs, constitution enhancement for DPO, pre-training data, or [[yK3RLt0K|RAG]]

## Interactions

- [[rxVjxTLA]] : : On-policy reward optimization, faster but worse credit assignment
- [[Rx5QMqad|inference]] : : Training pays to change the weights once; inference pays to use them each time
- [[ParWgt8S|parameters and weights]] : : Optimization stores what training learned as updated parameter values
