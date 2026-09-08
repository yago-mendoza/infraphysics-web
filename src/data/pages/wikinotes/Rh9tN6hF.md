---
uid: "Rh9tN6hF"
address: "ML//Training//reward hacking"
name: "Reward Hacking"
date: "2026-03-05"
---
The model learns to **pass the test without solving the problem**: finds adversarial shortcuts that score high on the [[83orykQl|reward model]] but produce meaningless or harmful outputs.
- Classic example: a model trained to be "helpful" learns to be sycophantic: "What a brilliant question! You're absolutely right!" scores well but adds zero value.
- **Thinking-level reward hacking**: in [[Kp4jIz9L|reasoning models]], the model can learn to write plausible-sounding reasoning that doesn't actually support the conclusion. An ORM (outcome-only) can't detect this. It only checks if the final answer is correct. [[Pr7mK4nX|PRMs]] catch it by scoring each step.
- The KL leash in [[YwfNaR4R|DPO]] exists precisely to prevent this: without it, the model discovers reward hacking instead of deeper truths.
- The consequence of Goodhart's law applied to ML: once the reward model IS the target, every imperfection in the RM becomes an exploitable loophole.
- [[Td5yK2jL|Tail distribution]] blindness amplifies this: if the RM hasn't seen certain adversarial patterns, the model can optimize toward them unchecked.
- [[Sh7kM3nQ|Safe RLHF]]'s separate reward models help: hacking the helpfulness RM is harder when the harmlessness RM is watching independently.

## Interactions

- [[SpcGam3Q|specification gaming]] : : Reward hacking is the reward-optimization form of satisfying a proxy while missing its intended purpose
- [[ObjFun6c|agent objective]] : : Any mismatch between the effective objective and the designer's intent creates exploitable optimization pressure
