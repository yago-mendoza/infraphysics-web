---
uid: "As6nR2hQ"
address: "ML//Transformer//attention//attention sink"
name: "Attention Sink"
date: "2026-03-05"
---
The first token walks into a transformer and somehow leaves with 80% of the attention, not because it's interesting, but because softmax needs somewhere to dump its spare change. The first token in a sequence absorbs a disproportionate amount of [[ml8njOQc|attention]] weight, regardless of its content. Even if it's a meaningless [[St5yK9jL|BOS]] token, attention heads allocate 20-80% of their weight to it.

##### Why it happens

- [[Sm8rH4nW|Softmax]] must assign attention weights that sum to 1.0. When no token is particularly relevant to the query, the model needs somewhere to "dump" the excess weight. The first token becomes this default sink because it's always available (every query can attend to position 0)
- The practical consequence for [[89ceVDr1|KV cache]] and long-context inference: if you use [[Sw3pJ7cR|sliding window attention]] and evict the first token from the cache, performance drops catastrophically. The model loses its sink and attention patterns break.
- StreamingLLM (2023) found the fix: always keep the first few tokens in the KV cache, even with a sliding window. With sink tokens preserved, models can process effectively infinite sequences. Without them, [[Px5mK9cJ|perplexity]] explodes after the context window fills.
- This is an emergent behavior, not trained: nobody teaches the model to use the first token as a sink. It arises naturally from the [[Sm8rH4nW|softmax]] constraint plus [[eGfBTEQ5|positional encoding]] making position 0 a consistent anchor.
- Implications for [[UHGnehtS|mechanistic interpretability]]: not all attention is semantic. Some attention patterns are just load-balancing artifacts of the softmax normalization. Interpreting attention weights as "what the model attends to" is misleading when sinks are involved.

