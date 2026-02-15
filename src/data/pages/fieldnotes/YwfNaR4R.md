---
uid: "YwfNaR4R"
address: "ML//Training//DPO"
name: "DPO"
date: "2026-02-15"
---
- Like SFT but with two options — maps "this is better than" (By > Bx contrastive pairs) directly back to individual token derivatives, widening the logit gap between tokens that led to the better path
- The model computes logits for BOTH outputs and adjusts weights so the preferred output gets higher logits (feels natural) and the rejected gets lower (feels unnatural)
- No ceiling — the AI is free to roam [[RnKMoC3a|latent space]], finding new ways to be smart (relational gradient learning → better in-context knowledge retrieval)
- Can only rearrange knowledge already baked in during [[2oNdlB5L|pre-training]] — doesn't create new knowledge
- KL divergence acts as an anchor — penalizes if the new probability distribution drifts too far from the reference model to avoid spamming "Wonderful! Excellent! Helpful!" just to farm points
- The KL leash paradox: remove KL and the model doesn't discover deeper truths — it discovers reward hacking (adversarial shortcuts that score high but mean nothing to humans)
- If robots do it through NNs or LLM reasoning, it's [[mCK28lZ6|iterative DPO]] — the best training method today
---
[[rxVjxTLA|PPO]] :: PPO uses sequence-level scalar reward via a reward model — every token gets the same offset, no custom derivative. DPO uses token-level logit derivatives — better credit assignment, no reward model needed
[[qcqxPFA0|SFT]] :: SFT creates a rigid ceiling with singular attractor learning — DPO escapes it by learning from contrasts, not imitation
[[0f5GJDwc|RLHF]] :: if humans choose between Bx and By, the pairs feed DPO — slower but grounded in real human judgment
[[mCK28lZ6|constitutional AI]] :: if an AI crafts By from Bx through reflection, those pairs feed iterative DPO — fastest path
