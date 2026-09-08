---
uid: "Et5mN8wJ"
address: "ML//Inference//extended thinking"
name: "Extended Thinking"
date: "2026-03-02"
---
Generate intermediate reasoning tokens before the final answer, the core technique behind [[Kp4jIz9L|reasoning models]] (o1, o3, R1, QwQ)
- Why it works (the mechanical explanation): the transformer has no memory between tokens, only [[JUby2DIy|context]]. Thinking tokens literally change the context before the answer is generated:
- Without thinking: [question] -> answer (context = just the question)
- With thinking: [question][reasoning...] -> answer (context = question + reasoning). The answer emerges from a **richer, different context**.
- This triggers a [[Ds3fR7kX|distributional shift]]: reasoning-then-conclusion is a distinct [[Ba6mR3kL|basin of attraction]] in [[RnKMoC3a|latent space]]. During [[2oNdlB5L|pretraining]], after explicit reasoning came more coherent conclusions. The thinking repositions the model into that basin.
- Not magic. It's geometry of the embedding space plus accumulated context. The thinking doesn't teach the model anything new; it **positions** it where it already knows how to produce quality output.
- **Pretraining is the ceiling**: SFT and RL post-training don't create new capabilities: they navigate toward useful regions of the distribution learned during pretraining. If the pretraining data didn't contain high-quality reasoning, no amount of RL recovers it. Models small + much RL < models large + little RL.
- Scales with compute: more thinking tokens = richer context = more precise positioning. [[Oy7kR3mL|o1]] does linear thinking, [[Oy9pK4nH|o3]] likely adds [[Ts5nR2mH|tree search]] (explore N branches, pick the best)
- [[ct4swTMy|Chain of thought]] was the prompting version. Extended thinking is the trained, RL-optimized version with dedicated compute budgets.

##### Failure modes

- [[Ov3tJ8kR|Overthinking]] on simple problems (distributional shift to the wrong basin), [[Eb4kN7xS|exposure bias]] compounding (each generated token is context the model may never have seen in training), path dependency in the [[Rs6cD4vX|residual stream]]
- In [[0f5GJDwc|RLHF]]/RLAIF: humans evaluate reasoned responses higher -> the model learned that showing reasoning produces structure leading to better-scored outputs.
- Each thinking token is a [[Ds4pJ8kF|decoding step]] that moves the [[Rs6cD4vX|residual stream]] to a new point: by the time the answer starts, the model is in a completely different neighborhood.

## Interactions

- [[oBpGr85I|in-context learning]] : : Extended thinking exploits in-context learning at its deepest: the model learns from its own generated reasoning tokens within the same forward sequence
