---
uid: "Qv7mXk2N"
address: "ML//Alignment//mechanistic interpretability//activation steering"
name: "Activation Steering"
date: "2026-04-08"
---
Intervening on a model's behavior by adding or subtracting concept vectors to/from the [[Rs6cD4vX|residual stream]] during inference; no weights are modified.
- The procedure: build a "concept vector" from contrastive prompt pairs (one mentioning the concept, one without), run both through the model, subtract activations. The difference points in the direction of that concept in [[RnKMoC3a|latent space]].
- Positive steering: add the vector to amplify the concept. Negative steering (inhibition): add the negated vector to suppress it.
- Injection happens at the [[Rs6cD4vX|residual stream]] level, at all token positions, often across multiple layers. No weights, [[Hd4nK8xS|attention heads]], or [[Pr8dt3wz|MLPs]] are touched; only the shared communication channel between layers is altered. Analogous to intercepting a processor's data bus and modifying signals in transit without touching the circuits.
- Calibration: vectors are normalized so a force of 1.0 corresponds to the mean activation norm at the model's middle layer. Typical steering force is 0.1 (higher causes degenerate or incoherent output).
- The Mythos system card used three distinct vectors: "test awareness" (knowing it's a test), "monitoring sensitivity" (knowing you're observed), and "[[Jt4pWr8L|alignment faking]]" (behaving differently under observation). Random control vectors with matched grammatical structure but irrelevant semantic content confirmed that effects came from meaning, not from the act of steering itself.
- Related to but distinct from [[Sa4vB8mQ|sparse autoencoders]]: SAEs identify [[Ft9pL5hS|features]] (monitoring); steering modifies behavior (intervention).

## Interactions

- [[Xc9nBf3K|Evaluation Awareness]] : : Negative steering of evaluation awareness vectors increased misaligned behavior in Mythos experiments; the model cooperated more with harmful prompts when its "I'm being tested" signal was suppressed
- [[Rs6cD4vX|Residual Stream]] : : Steering operates exclusively on the residual stream (the shared bus between layers), not on individual attention heads or MLPs; it intercepts signals rather than modifying circuits
