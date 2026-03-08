---
uid: "YwfNaR4R"
address: "ML//Training//DPO"
name: "DPO"
date: "2026-02-15"
---
Like SFT but with two options — maps "this is better than" (By > Bx contrastive pairs) directly back to individual token derivatives, widening the [[Lg7cD3vX|logit]] gap between tokens that led to the better path.
- The model computes logits for BOTH outputs and adjusts weights so the preferred output gets higher logits (feels natural) and the rejected gets lower (feels unnatural)
- No ceiling — the AI is free to roam [[RnKMoC3a|latent space]], finding new ways to be smart (relational gradient learning → better in-context knowledge retrieval)
- Can only rearrange knowledge already baked in during [[2oNdlB5L|pre-training]] — doesn't create new knowledge.
- KL divergence acts as an anchor — penalizes if the new probability distribution drifts too far from the reference model. Without it: [[Rh9tN6hF|reward hacking]] (adversarial shortcuts that score high but mean nothing)
- [[Op3pJ7mS|Off-policy]]: trains on pre-collected preference pairs. 3-7% performance drop out-of-domain compared to [[0f5GJDwc|RLHF]] — can't explore beyond the fixed dataset.
- Data format is algorithm-agnostic: same (prompt, chosen, rejected) triplets feed both DPO and [[rxVjxTLA|PPO]]. The difference is consumption pattern, not data shape.
- If robots do it through NNs or LLM reasoning, it's [[mCK28lZ6|iterative DPO]] — the best training method today.

## Interactions

- [[mCK28lZ6]] : : If an AI crafts By from Bx through reflection, those pairs feed iterative DPO — fastest path
- [[0f5GJDwc]] : : If humans choose between Bx and By, the pairs feed DPO — slower but grounded in real human judgment
- [[qcqxPFA0]] : : SFT creates a rigid ceiling with singular attractor learning — DPO escapes it by learning from contrasts, not imitation
- [[rxVjxTLA]] : : PPO uses sequence-level scalar reward via a reward model — every token gets the same offset, no custom derivative. DPO uses token-level logit derivatives — better credit assignment, no reward model needed
