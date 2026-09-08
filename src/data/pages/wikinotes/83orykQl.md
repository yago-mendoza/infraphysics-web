---
uid: "83orykQl"
address: "ML//Training//reward model"
name: "Reward Model"
date: "2026-02-15"
---
A neural network trained to score AI outputs on a scalar: "how good is this response?"
- Trained using "Bx > By" preference pairs from [[0f5GJDwc|RLHF]] or [[mCK28lZ6|RLAIF]]
- Used by [[rxVjxTLA|PPO]] to provide reward signal during training.
- The quality ceiling of [[rxVjxTLA|PPO]] is the quality ceiling of the reward model: every blind spot becomes a [[Rh9tN6hF|reward hacking]] target.
- Not just a training artifact: a standalone product. You can use an RM at [[Rx5QMqad|inference]] time to score and filter outputs, rerank candidates, or detect policy violations without retraining.
- [[Sh7kM3nQ|Safe RLHF]] trains TWO separate RMs (helpfulness and harmlessness) to avoid conflating the two axes into one ambiguous scalar.

## Interactions

- [[YwfNaR4R]] : : DPO skips the reward model entirely: maps preferences directly to token gradients
