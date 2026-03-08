---
uid: "Cm7jR4sQ"
address: "ML//Transformer//attention//causal masking"
name: "Causal Masking"
date: "2026-03-06"
---
Set the upper triangle of the attention matrix to -∞ (→ 0 after [[Sm8rH4nW|softmax]]) so tokens can't attend to future positions.
- Effect: attention never carries information from later tokens back to earlier ones — preserves autoregressive property.
- The new token CAN attend to all previous tokens. Previous tokens CANNOT attend to the new one.
- Enables [[89ceVDr1|KV cache]]: since previous tokens' representations are "closed" (won't change), we can cache their K and V.
- Without causal masking ([[En6fL2qY|encoder]]-style): all tokens see all others → better enrichment of early positions, but can't do generation.
- Another reason not to save enriched [[haA3MDhG|embeddings]]: without masking you'd have to RECOMPUTE EVERYTHING each time a new token arrives.
- [[MwbJnjdN|BERT]] has no masking → bidirectional understanding. [[U7ljk7Wf|GPT]] has masking → autoregressive generation. [[4WOV3Wpt|Encoder-decoder]] cross-attention has no masking (decoder sees all encoder tokens freely)
