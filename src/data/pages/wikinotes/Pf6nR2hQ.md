---
uid: "Pf6nR2hQ"
address: "ML//Training//parameter freezing"
name: "Parameter Freezing"
date: "2026-03-05"
---
Choosing which model parameters to update during [[esHo5jMx|fine-tuning]] and which to lock (freeze)
- In standard fine-tuning and [[YwfNaR4R|DPO]]: nothing is frozen by default: all parameters (attention + MLP) get updated.
- In [[3kgsj4Y4|LoRA]]: base model frozen, small adapter matrices trained. Typically applied to [[Pm5xH9bL|W_Q, W_K, W_V, W_O]] (irónicamente las de attention, no MLP) because behavior changes most with fewest params there.
- The [[zSFOpgNO|tokenizer]] is almost never touched in fine-tuning: changing it means changing the [[Em3xR7wP|embedding matrix]], which is basically starting over.
- Trainable vs frozen is a spectrum: full fine-tuning (0% frozen) → LoRA (~99% frozen) → prompt tuning (100% frozen, only input modified)
