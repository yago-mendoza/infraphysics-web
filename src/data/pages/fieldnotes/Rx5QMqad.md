---
uid: "Rx5QMqad"
address: "ML//Inference"
name: "Inference"
date: "2026-02-15"
---
- At inference time, only the last token's hidden state matters — attention has encoded all previous context into a single 1×D vector
- That vector hits the [[2GCBLdlB|LM Head]], producing logits over the vocabulary
- [[5qpyTXdv|sampling]] picks the actual next token from those logits
- Auto-regressive: each generated token becomes input for the next — the model eats its own output
---
[[QtZjVPKo|Transformer]] :: the transformer produces the hidden states; inference reads only the last one
[[yK3RLt0K|RAG]] :: RAG stuffs retrieved documents into the context window before inference — the model sees them as regular input
