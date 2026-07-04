---
uid: "Pr8dt3wz"
address: "ML//Transformer//feed-forward network"
name: "Feed-Forward Network"
date: "2018-09-10"
aliases: ["MLP"]
---
The "other half" of each transformer layer: linear → activation → linear. W₂ · ReLU(W₁ · x + b₁) + b₂ (or [[uuSdeqbX|GELU]] in modern models)
- It's basically a perceptron that chunks [[Ft9pL5hS|features]]: if the current embedding aligns with a feature direction above threshold ([[ZS34nG4d|ReLU]]), that feature gets added.
- Example: if a vector already points toward "Michael" and "Jordan", the MLP detects compatibility and adds the "basketball" direction. Linears have bias.
- Most of the model's parameters live here (~2/3), not in [[ml8njOQc|attention]] (~1/3). MLP stores facts, attention routes context.
- Recent theory: the FFN acts as a key-value memory (keys are the first layer, values the second).
- No matter how big the model, the [[zSFOpgNO|tokenizer]] (embedding dimension) bottlenecks comprehension. MLP width is limited by it.
- Multilayer perceptrons live in MLP layers, not attention layers.

## Interactions

- [[ml8njOQc|attention]] : : Attention routes information between tokens, FFN stores and transforms it: the two complementary halves of each layer
