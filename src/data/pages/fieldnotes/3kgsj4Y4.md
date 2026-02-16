---
uid: "3kgsj4Y4"
address: "ML//Training//fine-tuning//LoRA"
name: "LoRA"
date: "2023-04-18"
---
- Low-Rank Adaptation: freeze the base model, inject small trainable matrices (rank 4-64) into attention layers
- Train ~1% of parameters, get ~90% of full fine-tuning quality
- QLoRA adds [[qY2jOLny|quantization]] on top — fine-tune a 65B model on a single 48GB GPU
- Democratized fine-tuning. Everyone can customize a foundation model now.
