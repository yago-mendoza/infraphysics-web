---
uid: "Bn8xR7wP"
address: "ML//neural network//batch normalization"
name: "Batch Normalization"
date: "2026-02-28"
---
Normalize each layer's activations across the mini-batch to have zero mean and unit variance, then apply a learnable scale and shift. Introduced in 2015, it was the first normalization technique that made deep networks reliably trainable.
- Why it works (debated): the original paper claimed it reduces "internal covariate shift" (each layer's input distribution changes as previous layers update). Later research showed this explanation is incomplete. The more likely reason: it smooths the [[DxaRVjHg|loss function]] landscape, making [[Gd5tR8wP|gradient descent]] more stable.
- The batch dependency problem: normalization statistics (mean, variance) are computed over the current mini-batch during training. At inference time, you use running averages from training. Small batch sizes make the statistics noisy, hurting performance. This is why batch norm struggles with batch size < 32.
- [[mcdxPW3m|Layer normalization]] replaced batch norm in [[QtZjVPKo|Transformers]] because language models process sequences of varying length with small batch sizes. Layer norm normalizes across features within a single example, not across the batch. No batch dependency, no batch size sensitivity.
- Still dominant in [[G1JW8o79|CNN]]s and [[0WgYCyiZ|ResNet]] architectures. ResNet's success (training 100+ layer networks) was partly enabled by batch norm stabilizing gradient flow through very deep convolution stacks.
- The learnable scale (gamma) and shift (beta) parameters are critical: they let the network "undo" the normalization if needed. The model can learn gamma=original_std, beta=original_mean to recover the unnormalized activations for layers where normalization hurts.

