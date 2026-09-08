---
uid: "Rx5QMqad"
address: "ML//Inference"
name: "Inference"
date: "2026-02-15"
---
Inference runs a trained model with current inputs to produce predictions or generations. The weights are used rather than learned, although the surrounding application may retrieve information, update memory or call tools between invocations.

For an autoregressive LLM, the transformer produces logits for the next token, [[5qpyTXdv|sampling]] selects a continuation, and that token becomes input to the next step. The economics differ sharply from training: one training run creates weights, while inference may reuse them across millions of requests.

Training builds the instrument. Inference is every performance, including the electricity bill and the waiting audience.

## Interactions

- [[89ceVDr1|KV cache]] : : Autoregressive inference caches prior attention keys and values to avoid recomputing them for each token
- [[InfEcon9|inference economics]] : : Repetition, latency and utilization turn inference efficiency into a product constraint
- [[yK3RLt0K|RAG]] : : RAG retrieves documents before inference so the model can condition on them as ordinary context
