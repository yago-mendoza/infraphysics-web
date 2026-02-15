---
uid: "83orykQl"
address: "ML//Training//reward model"
name: "reward model"
date: "2026-02-15"
---
- A neural network trained to score AI outputs on a scalar — "how good is this response?"
- Trained using "Bx > By" preference pairs from [[0f5GJDwc|RLHF]] or [[mCK28lZ6|RLAIF]]
- Used by [[rxVjxTLA|PPO]] to provide reward signal during training
- The quality ceiling of PPO is the quality ceiling of the reward model
---
[[YwfNaR4R|DPO]] :: DPO skips the reward model entirely — maps preferences directly to token gradients
