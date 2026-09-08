---
uid: "Rt3kM5nQ"
address: "ML//Mixture of Experts//router"
name: "Router"
date: "2026-03-08"
---
The gating mechanism in [[x5qaZizz|Mixture of Experts]] that decides which experts process each token. A small neural network (often a single linear layer + [[Sm8rH4nW|softmax]]) that takes a token's representation and outputs a probability distribution over experts.
- Typically routes each token to the top-1 or top-2 experts out of 8-64+ total. This is what makes MoE efficient: only a fraction of parameters are active per token, so a 100B parameter MoE model might use only 13B parameters per [[Fw4pJ8mS|forward pass]]

##### Load balancing

- The load balancing problem: without constraints, the router tends to collapse, sending most tokens to the same 1-2 experts while others go unused. This wastes capacity and defeats the purpose. Fix: an auxiliary loss that penalizes uneven expert utilization.
- Why routing matters for [[iTljPiGW|scaling laws]]: MoE decouples parameter count from compute cost. You can scale parameters (more experts) without proportionally scaling FLOPs (each token still hits the same number of experts). This changes the optimal scaling relationship.
- Token-level routing means different tokens in the same sequence can hit different experts. The model implicitly learns to specialize experts: some handle code, others handle math, others handle natural language. But this specialization is emergent, not designed.
- The [[Pr8dt3wz|feed-forward network]] layers are what get replicated as experts. [[ml8njOQc|Attention]] is shared across all tokens (global context), but FFN computation is routed (specialized processing). This split reflects the observation that attention handles "where to look" while FFN handles "what to do with it".

