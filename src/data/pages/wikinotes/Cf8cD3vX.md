---
uid: "Cf8cD3vX"
address: "ML//Training//fine-tuning//catastrophic forgetting"
name: "Catastrophic Forgetting"
date: "2026-03-05"
---
When [[esHo5jMx|fine-tuning]] on new data destroys knowledge learned during [[2oNdlB5L|pre-training]]. The model gets better at the new task but forgets everything else. The weights that encoded general knowledge get overwritten by task-specific gradients.
- This is the core problem that [[3kgsj4Y4|LoRA]], [[e9JZ4ItW|QLoRA]], and [[8Ug1hKjZ|ReFT]] were designed to solve. Instead of updating all parameters (which risks overwriting pre-trained knowledge), they freeze most weights and only train small adapters or low-rank deltas.
- [[Pf6nR2hQ|Parameter freezing]] is the simplest defense: freeze early layers (which encode general features like syntax and semantics) and only fine-tune later layers (which encode more task-specific patterns). The trade-off: less forgetting but also less adaptation.
- Why it happens mechanistically: neural networks are distributed representations. The same weights participate in many different capabilities. When you optimize for task A, the [[Gd5tR8wP|gradient]] doesn't know which weight updates will break task B.
- [[bdkM9Msn|Transfer learning]] depends on NOT forgetting: the whole point is to transfer knowledge from pre-training to a new task. Catastrophic forgetting is the failure mode where the transfer goes backward.
- The continual learning problem: how to learn task after task without forgetting. No fully general solution exists. Practical mitigations include replay (mixing old data with new), elastic weight consolidation (penalizing changes to important weights), and adapter methods.

## Interactions

- [[3kgsj4Y4|LoRA]] : : LoRA is the dominant solution: freeze all weights, train only low-rank adapter matrices. The original weights are preserved perfectly because they're never updated. Forgetting is architecturally impossible
- [[Mc4xR8wP|Model Collapse]] : : Model collapse is forgetting at the data level (training on synthetic data loses the tails), catastrophic forgetting is at the weight level (fine-tuning overwrites pre-trained knowledge). Both destroy information irreversibly
