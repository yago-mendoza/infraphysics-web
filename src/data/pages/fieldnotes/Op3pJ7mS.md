---
uid: "Op3pJ7mS"
address: "ML//Training//on-policy vs off-policy"
name: "On-Policy vs Off-Policy"
date: "2026-02-23"
---
**On-policy**: the model generates data during training, then learns from its own outputs. [[rxVjxTLA|PPO]] is on-policy — it scores outputs that the current policy produced.
- **Off-policy**: the model learns from a fixed dataset of pre-collected examples. [[YwfNaR4R|DPO]] is off-policy — it trains on preference pairs (prompt, chosen, rejected) that were generated beforehand.
- On-policy advantage: the model always trains on data from its current distribution — no stale examples.
- Off-policy advantage: no generation during training = much faster per step, data reusable across runs.
- The data format is **algorithm-agnostic**: the same (prompt, chosen, rejected) pairs can feed both [[0f5GJDwc|RLHF]]/PPO and DPO. The difference is when and how the data is generated and consumed.
- PPO's on-policy nature makes it actually slower despite theoretically faster convergence — generating outputs mid-training is expensive.
- [[YwfNaR4R|DPO]]'s off-policy weakness: 3-7% performance drop out-of-domain compared to RLHF. Training on fixed data means the model can't explore regions the dataset didn't cover.

## Interactions

- [[bNGmRCsR|Training]] : : The on/off-policy distinction cuts across all training methods — same data format, different consumption patterns
