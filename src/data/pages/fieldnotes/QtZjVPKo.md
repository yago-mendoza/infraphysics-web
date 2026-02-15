---
uid: "QtZjVPKo"
address: "ML//Transformer"
name: "Transformer"
date: "2026-02-15"
---
- The architecture behind GPT, BERT, and every modern LLM
- D latent features per hidden state (D=4096 typical) — most are not human-interpretable abstractions
- Context vector: the last hidden state, right before the [[2GCBLdlB|LM Head]]
- In [[Rx5QMqad|inference]]: a 1×D vector — attention has encoded all previous tokens into a single embedding
- In training: an n_tokens×D matrix — attention mask computes every token's hidden state from previous tokens, producing T-1 training examples from sequence length T
- Each layer moves the input vector across [[RnKMoC3a|latent space]] — last layer contains organized, routable information
---
[[Rx5QMqad|Inference]] :: at inference time, only the last token's hidden state matters — attention encoded everything
[[bNGmRCsR|Training]] :: training exploits parallelism — all T-1 examples computed in one forward pass
