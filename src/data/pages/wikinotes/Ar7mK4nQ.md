---
uid: "Ar7mK4nQ"
address: "ML//autoregressive"
name: "Autoregressive"
date: "2026-02-25"
---
The generation paradigm behind [[U7ljk7Wf|GPT]] and all decoder-only models: predict the next token given all previous tokens, one at a time, left to right.
- This is why [[Cm7jR4sQ|causal masking]] exists. If the model could see future tokens during training, it would cheat. Masking forces it to learn genuine left-to-right prediction, matching how it must generate at inference time.
- The [[89ceVDr1|KV cache]] optimization is a direct consequence: since each token's representation depends only on tokens before it, previous computations are "closed" and can be cached. Non-autoregressive models can't do this.
- Generation loop: run [[Fw4pJ8mS|forward pass]] to get [[Lg7cD3vX|logits]] from [[2GCBLdlB|LM head]], [[5qpyTXdv|sample]] next token, append to sequence, repeat. Each iteration is one [[Ds4pJ8kF|decoding step]]
- The fundamental bottleneck: generation is sequential. You can't parallelize across tokens because each depends on the previous. [[T9kOs8YY|Speculative decoding]] tries to work around this with a draft-then-verify approach.
- Training is parallel (all positions computed at once via masking), but inference is serial. This asymmetry is why training a model is fast per token but generation is slow.
- [[MwbJnjdN|BERT]] is the counterexample: it's NOT autoregressive. It sees all tokens simultaneously (bidirectional), which is why it's better at understanding but can't generate text naturally.

## Interactions

- [[Cl2rB6nL|Causal Language Modeling]] : : Causal LM is the training objective, autoregressive is the generation mechanism. Same coin, two sides: one describes what the model learns, the other describes how it generates
- [[Eb4kN7xS|Exposure Bias]] : : Exposure bias is an autoregressive-specific pathology. The model trains on real sequences but generates from its own outputs, so errors compound because each token conditions on potentially wrong predecessors
