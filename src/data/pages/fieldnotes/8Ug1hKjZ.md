---
uid: "8Ug1hKjZ"
address: "ML//Training//fine-tuning//ReFT"
name: "ReFT"
date: "2026-02-26"
---
- Representation Fine-Tuning: instead of adapting weights ([[3kgsj4Y4|LoRA]]), intervene on internal representations (activations)
- Modify a learned linear subspace of hidden activations at specific layers and positions
- Far fewer parameters than LoRA — same or better performance with 10–50x fewer trainable params
- Built on representation engineering: steer behavior via internal representations, not weight edits
---
[[3kgsj4Y4|LoRA]] :: ReFT is a different philosophy — LoRA adds low-rank adapters to weight matrices, ReFT intervenes on the representations those weights produce
