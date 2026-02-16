---
uid: "Pr8dt3wz"
address: "ML//Transformer//feed-forward network"
name: "feed-forward network"
date: "2018-09-10"
---
- The "other half" of each transformer layer: two linear transforms with activation between
- W₂ · GELU(W₁ · x + b₁) + b₂
- Most of the model's parameters live here, not in attention
- Recent theory: the FFN acts as a key-value memory — keys are the first layer, values the second
---
[[ml8njOQc|attention]] :: attention routes information between tokens, FFN stores and transforms it — the two complementary halves of each layer
