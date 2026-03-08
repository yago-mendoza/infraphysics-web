---
uid: "Ov3tJ8kR"
address: "ML//Inference//extended thinking//overthinking"
name: "Overthinking"
date: "2026-03-05"
---
Documented empirically: forcing long [[Et5mN8wJ|extended thinking]] on simple problems makes the model **worse**, not better.
- On simple questions where the direct answer has high probability from the start, thinking introduces:
- More opportunities for self-consistency bias — the model prefers branches consistent with its own [[2oNdlB5L|pretraining]] biases, not necessarily the most correct ones.
- The model can "convince itself" to change a correct answer — reasoning generates context that activates irrelevant complexity.
- Drift toward regions of [[RnKMoC3a|latent space]] associated with unnecessary complexity.
- Papers show [[Oy7kR3mL|o1]] performs worse than GPT-4 on simple common-sense questions precisely because of this — the thinking generates context that triggers a [[Ds3fR7kX|distributional shift]] to the wrong region.
- Token budgets (like Anthropic's) are partially a solution — not just cost control, but preventing the model from thinking too much on problems that don't need it.
- The deeper problem: the model has no reliable metacognition. It can't assess "do I need to think more?" — it just generates tokens until told to stop.

