---
uid: "rxVjxTLA"
address: "ML//Training//PPO"
name: "PPO"
date: "2026-02-15"
---
- Requires a single output to score via a [[83orykQl|reward model]] — no contrastive pairs needed upfront
- Presumes holistic properties require sequence-level scoring — false, IMO
- Faster than DPO in theory (no humans clicking or robots reasoning beforehand) — yet on-policy behavior (scoring during training) makes it actually slower
- In addition to everything DPO uses, adds: the reward model, a critic that reduces variance by predicting scores, plus LLM actor and reference model for KL divergence
- SGD reward signal derives from sequence-level scalar, not token-level logit derivatives — credit assignment problem: every token gets the same offset
- Considered RLAIF when using a reward model trained from [[0f5GJDwc|RLHF]] data
---
[[YwfNaR4R|DPO]] :: DPO maps preferences directly to token-level gradients — no reward model middleman, better credit assignment. papers argue PPO captures holistic non-compositional properties DPO loses — but attention already encodes inter-token dependencies before logits reach the loss
