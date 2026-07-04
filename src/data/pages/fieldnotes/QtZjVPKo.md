---
uid: "QtZjVPKo"
address: "ML//Transformer"
name: "Transformer"
date: "2026-02-15"
---
The architecture behind GPT, BERT, and every modern LLM.
- Standard block: { [[ml8njOQc|Attention]] → [[Pr8dt3wz|MLP]] } × N layers. GPT-3: N=96. GPT-2 small: N=12. Each block has [[dTnuW5yO|residual connections]] + [[mcdxPW3m|layer norm]]
- ~1/3 attention (context routing between tokens), ~2/3 MLP (fact storage and feature detection). Path through [[RnKMoC3a|latent space]]: alternating context and fact, 1 context, 1 fact, 1 context, 1 fact.
- D latent features per hidden state (D=4096 typical). Most are not human-interpretable abstractions.
- Context vector: the last hidden state, right before the [[2GCBLdlB|LM Head]]. The last token has been thrown through so many layers it knows exactly what it is relative to everything else, sufficient to predict next.
- In [[Rx5QMqad|inference]]: a 1×D vector. In training: an n_tokens×D matrix. Attention mask computes every token's hidden state, producing T-1 training examples from sequence length T.

## Interactions

- [[Rx5QMqad|Inference]] : : At inference time, only the last token's hidden state matters. Attention encoded everything
- [[bNGmRCsR|Training]] : : Training exploits parallelism: all T-1 examples computed in one forward pass
