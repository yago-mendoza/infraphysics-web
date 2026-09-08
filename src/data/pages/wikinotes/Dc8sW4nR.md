---
uid: "Dc8sW4nR"
address: "ML//Transformer//decoder"
name: "Decoder"
date: "2026-03-02"
---
[[U7ljk7Wf|GPT]]-style architecture: [[vCs7RZqL|self-attention]] with [[Cm7jR4sQ|causal masking]]: each token only sees tokens before it.
- GPT is decoder-only: no encoder, no [[LZEkMuDa|cross-attention]]. If it translates, it learned translation as a pattern during [[2oNdlB5L|pre-training]], not from a dedicated encoder.
- In [[4WOV3Wpt|encoder-decoder]] models (T5, translation): decoder has both causal self-attention AND cross-attention to the encoder output.
- Cross-attention in decoder: Q comes from the target language (what we're generating), K and V from the source (encoder output). Starts with [[St5yK9jL|[BOS]]] as the cold start.
- Masking enables [[89ceVDr1|KV cache]]: previous tokens are "closed": their representations don't change when a new token arrives.
