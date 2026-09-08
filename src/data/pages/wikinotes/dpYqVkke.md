---
uid: "dpYqVkke"
address: "ML//Transformer//attention//multi-head attention"
name: "Multi-Head Attention"
date: "2018-08-20"
---
Run [[vCs7RZqL|self-attention]] multiple times in parallel with different learned [[Pm5xH9bL|projections]]: each [[Hd4nK8xS|head]] operates on a reduced subspace.
- Why reduce dimension? Each head can specialize: syntax, coreference, positional patterns, semantic similarity, [[Ih8nK5xW|induction]] (pattern-copying). Different types of relationships in different subspaces.
- No explicit mechanism forces this: specialization **emerges** from training. Two heads learning the same thing don't reduce [[DxaRVjHg|loss]], so [[aufHHy2p|backprop]] pushes them to diversify.
- GPT-3: 96 heads per layer, each 128-dim. Concatenate all outputs, project back to model dimension via W_O.
- [[Gq6mB2vY|GQA]] shares K/V across groups of heads to reduce [[89ceVDr1|KV cache]], the modern optimization.
- Heads can form **cross-layer circuits**: [[Ih8nK5xW|induction heads]] are two heads in consecutive layers that coordinate. One finds matching prefixes, the other copies what followed.
