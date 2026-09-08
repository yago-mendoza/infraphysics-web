---
uid: "UHGnehtS"
address: "ML//Alignment//mechanistic interpretability"
name: "Mechanistic Interpretability"
date: "2026-02-16"
---
Studying what each [[RnKMoC3a|latent]] feature actually represents; trying to open the black box.
- The [[3EKErev3|alignment]] approach that says "instead of trusting the model, understand it".
- Key challenge: [[Sp2tK6jL|superposition]]. Neurons represent many [[Ft9pL5hS|features]] simultaneously, making individual neurons uninterpretable.
- [[Sa4vB8mQ|Sparse autoencoders]] decompose superposed activations into interpretable features, the path toward [[Mn7cR3xF|monosemanticity]]
- "Towards Monosemanticity" (Anthropic, 2023): dictionary learning to extract clean features from superposed representations.
- Techniques: probing (test individual neurons), sparse autoencoders (decompose activations), activation patching (swap activations between runs to find causal features)
- [[Ih8nK5xW|Induction heads]] are the "hello world", the first concrete, verified circuit: two [[Hd4nK8xS|attention heads]] in consecutive layers that implement pattern-copying for [[oBpGr85I|in-context learning]]. Proof that interpretable structure exists in the [[Rs6cD4vX|residual stream]]
- The ultimate goal: identify what every head and MLP does across all layers, a complete map of how the model thinks.

## Interactions

- [[0f5GJDwc|RLHF]] : : Interpretability reveals what [[0f5GJDwc|RLHF]] actually optimizes; whether the [[83orykQl|RM]] captures intent or just a proxy
- [[a0AXrxFY|Red teaming]] : : Red teaming finds failure modes empirically (from outside); interpretability finds them mechanistically (from inside)
- [[Ih8nK5xW|induction head]] : : Induction heads are the best-understood transformer circuit. Proof of concept that mechanistic interpretability can identify concrete, functional components
