---
uid: "3kgsj4Y4"
address: "ML//Training//fine-tuning//LoRA"
name: "LoRA"
date: "2023-04-18"
---
The cheat code that democratized fine-tuning: freeze 99% of the model, inject tiny trainable matrices into the joints, and somehow get almost the same result. Low-Rank Adaptation: freeze the base model, inject small trainable matrices (rank 4-64) into attention layers.
- Typically applied to [[Pm5xH9bL|W_Q, W_K, W_V, W_O]] (irónicamente the attention matrices, not MLP) because behavior changes most with fewest parameters there.
- Train ~1% of parameters, get ~90% of full fine-tuning quality.
- QLoRA adds [[qY2jOLny|quantization]] on top: fine-tune a 65B model on a single 48GB GPU.
- Democratized fine-tuning. Everyone can customize a foundation model now.
- The [[zSFOpgNO|tokenizer]] is almost never touched. Changing it means changing the [[Em3xR7wP|embedding matrix]], basically starting over.
