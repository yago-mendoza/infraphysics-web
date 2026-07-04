---
uid: "WgtS03xc"
address: "ML//neural network//weight sharing"
name: "weight sharing"
date: "2026-07-04"
---
Reusing the same parameters at many positions instead of learning separate ones for each. The reason an [[mBCcy7bn|RNN]] or [[rK1Dy2Fa|LSTM]] needs one small set of weights for a sequence of any length.
- Bakes in an assumption: the rule is the same at every position (every timestep, every image patch). Forces a general rule instead of position-by-position memorization.
- Also the core trick of CNNs, where one filter slides across the whole image.
- Lets a single trained model handle inputs of any length or size without changing shape.
