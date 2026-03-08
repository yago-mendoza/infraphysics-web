---
uid: "MwbJnjdN"
address: "ML//model//BERT"
name: "BERT"
date: "2019-01-20"
---
Bidirectional Encoder Representations from Transformers (Google, 2018)
- [[En6fL2qY|Encoder]]-only: sees the full input in both directions (no [[Cm7jR4sQ|causal masking]]), unlike [[U7ljk7Wf|GPT]]'s left-to-right.
- Trained with [[1zpNyBrj|masked language modeling]] (predict hidden tokens) + [[Ns8fH4xP|NSP]] (predict if sentences are consecutive, later found unhelpful)
- No masking = better enrichment of all positions — early words get fully disambiguated by later context. But can't generate text.
- Output: one vector per token. [[St5yK9jL|[CLS]]] token for sentence-level tasks. [[Dl5mK9cJ|Downstream layers]] convert vectors to task outputs.
- Dominated NLP benchmarks for 2 years. Fine-tuned with [[Ct9xL5mW|contrastive learning]] → [[Sr7tD3vH|sentence transformers]] for [[yK3RLt0K|RAG]]

## Interactions

- [[QtZjVPKo|Transformer]] : : Encoder-only variant — proved that pre-training + fine-tuning dominates NLP
