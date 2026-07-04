---
uid: "rxVjxTLA"
address: "ML//Training//PPO"
name: "PPO"
date: "2026-02-15"
---

##### ROBOTICS
- Known as --Proximal [[4vDsUzfM|Policy]] Optimisation--.
- Learns through --exploration-- (*"proximal" steps*).
- **[[4vDsUzfM|Policy]]** learns in a --physical environment-- ([[q3TzzAYI|NVIDIA]] *OMNIVERSE*)

##### LLMs
- The environment becomes here a RM trained via RLHF.
> In DPO, RLHF is used to [d]irectly update the weights ([[4vDsUzfM|policy]]).
- [[Op3pJ7mS|On-policy]]: generates outputs during training and scores them in real-time via a [[83orykQl|RM]]. No contrastive pairs needed upfront.
- Presumes holistic properties require sequence-level scoring. False, IMO.
- Faster than DPO in theory (no humans clicking or robots reasoning beforehand), yet on-[[4vDsUzfM|Policy]] behavior (scoring during training) makes it actually slower.
- In addition to everything DPO uses, adds: the reward model, a critic that reduces variance by predicting scores, plus LLM actor and reference model for KL divergence.
- SGD reward signal derives from sequence-level scalar, not token-level logit derivatives. Credit assignment problem: every token gets the same offset.
- Considered RLAIF when using a reward model trained from [[0f5GJDwc|RLHF]] data.

## Interactions

- [[YwfNaR4R]] : : DPO maps preferences directly to token-level gradients: no reward model middleman, better credit assignment. papers argue PPO captures holistic non-compositional properties DPO loses, but attention already encodes inter-token dependencies before logits reach the loss
