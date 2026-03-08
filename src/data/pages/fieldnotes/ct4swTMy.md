---
uid: "ct4swTMy"
address: "ML//chain of thought"
name: "Chain of Thought"
date: "2023-01-05"
---
"Let's think step by step." — prompt the model to show reasoning before the answer.
- Wei et al. (2022): dramatically improves math, logic, multi-step reasoning.
- Works because intermediate tokens change the [[JUby2DIy|context]] before the answer — triggers a [[Ds3fR7kX|distributional shift]] toward the "reasoned conclusion" region of [[RnKMoC3a|latent space]]
- Tree-of-thought generalizes it to branching exploration of multiple reasoning paths.
- [[Et5mN8wJ|Extended thinking]] is the trained, scaled version: same principle (more reasoning tokens = better answers), but optimized with RL and dedicated compute instead of a prompt hack.
- [[Kp4jIz9L|Reasoning models]] (o1, o3, R1) prove CoT scales — trained thinking chains outperform prompted ones by orders of magnitude on hard problems.

## Interactions

- [[ovLF1FzI|prompt engineering]] : : Chain of thought is the most impactful prompt engineering technique — more reasoning tokens = better answers
- [[Et5mN8wJ|extended thinking]] : : CoT was the discovery, extended thinking is the scaling — prompt-level trick evolved into RL-trained inference capability
