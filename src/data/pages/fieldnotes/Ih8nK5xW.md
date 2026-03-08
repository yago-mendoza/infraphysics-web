---
uid: "Ih8nK5xW"
address: "ML//Transformer//attention//induction head"
name: "Induction Head"
date: "2026-03-08"
---
One of the most important discoveries of [[UHGnehtS|mechanistic interpretability]] — concrete, verifiable, and functionally understood.
- The pattern they explain: if [A][B] appears in the context and later [A] appears again, the model predicts [B] with high probability. "El gato duerme. El perro ladra. El gato ____" → predicts "duerme".
- This IS [[oBpGr85I|in-context learning]] at the lowest level — the model learns patterns within the current sequence, no weight updates.

##### The circuit

- **Two** [[Hd4nK8xS|attention heads]] in consecutive layers working together:
- **Head 1** (prefix matching head): the current token looks back and finds tokens similar to itself in the past.
- **Head 2** (induction head): copies what came AFTER that previous occurrence.
- Not a special architecture — they're regular heads with regular [[Pm5xH9bL|W_Q, W_K, W_V]] matrices, initialized randomly. The [[aufHHy2p|gradient]] pushed them into this specialization because it reduced [[DxaRVjHg|loss]]
- In large models there are **multiple** induction circuits — some more specialized, some for different pattern types. They're a subset of the 96 heads per layer, not all of them.
- During training there's a **phase transition**: when induction heads emerge, the loss drops abruptly — the model suddenly gets much better at following context patterns.
- The "hello world" of understanding transformers from the inside — proof that [[ml8njOQc|attention]] heads form interpretable circuits, not just opaque weights.

## Interactions

- [[IdfB7mVS|few-shot learning]] : : Few-shot prompting works partly because induction heads are reading the examples and copying their patterns to new inputs
- [[yK3RLt0K|RAG]] : : RAG, few-shot, chain-of-thought — these prompting techniques work partly because induction heads exist, reading context and propagating patterns
