---
uid: "Hd4nK8xS"
address: "ML//Transformer//attention//head"
name: "Attention Head"
date: "2026-03-08"
---
One unit of [[dpYqVkke|multi-head attention]]: its own [[Pm5xH9bL|W_Q, W_K, W_V]] projections operating on a reduced dimension (e.g. 128-dim instead of 12288)
- Why reduce? Each head can specialize in a different type of relationship (syntax, coreference, semantic, positional) by operating in its own subspace.
- No explicit mechanism forces specialization. It **emerges** from training. If two heads learn the same thing, they don't reduce [[DxaRVjHg|loss]], so [[aufHHy2p|backprop]] pushes them to diversify.

##### Emergent specialization

- Empirically observed specializations: syntax tracking, coreference resolution, positional distance, and [[Ih8nK5xW|induction heads]] (pattern-copying circuits for [[oBpGr85I|in-context learning]])
- GPT-3: 96 heads per layer × 96 layers. Outputs are concatenated and projected back to model dimension via W_O.
- The full process (Q·K → softmax → ×V → sum columns → suggested vector change) IS one head of attention.
- The question [[UHGnehtS|mechanistic interpretability]] asks: if you can identify what each head does across 96 heads × 96 layers, you have a complete map of how the model thinks.

## Interactions

- [[Ih8nK5xW|induction head]] : : Induction heads are regular attention heads whose emergent specialization is pattern-copying, the best-understood example of head specialization
