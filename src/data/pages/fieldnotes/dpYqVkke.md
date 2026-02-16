---
uid: "dpYqVkke"
address: "ML//Transformer//attention//multi-head attention"
name: "multi-head attention"
date: "2018-08-20"
---
- Run [[vCs7RZqL|self-attention]] multiple times in parallel with different learned projections
- Each head can specialize: one learns syntax, another coreference, another positional patterns
- GPT-3 has 96 heads. Concatenate outputs, project back to model dimension.
