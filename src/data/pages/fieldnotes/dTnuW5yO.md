---
uid: "dTnuW5yO"
address: "ML//Transformer//residual connection"
name: "Residual Connection"
date: "2018-09-10"
---
x + f(x): add the input directly to the output of each sublayer.
- Creates the [[Rs6cD4vX|residual stream]]: a persistent vector that flows through all layers, accumulating additive deltas from [[ml8njOQc|attention]] and [[Pr8dt3wz|MLP]] blocks.
- Keeps gradients flowing through 100+ layers without [[7IHpnRNx|vanishing]]
- Borrowed from [[0WgYCyiZ|ResNet]]. Every transformer block has two: one after attention, one after FFN.
- Together with [[mcdxPW3m|layer norm]], they form the structural backbone of each [Attention → MLP] block.
