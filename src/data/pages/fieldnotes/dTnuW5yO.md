---
uid: "dTnuW5yO"
address: "ML//Transformer//residual connection"
name: "residual connection"
date: "2018-09-10"
---
- x + f(x) — add the input directly to the output of each sublayer
- Keeps gradients flowing through 100+ layers without vanishing
- Borrowed from [[0WgYCyiZ|ResNet]]. Every transformer layer has two: one after attention, one after FFN.
