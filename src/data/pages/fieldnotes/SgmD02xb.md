---
uid: "SgmD02xb"
address: "ML//neural network//activation function//sigmoid"
name: "sigmoid"
date: "2026-07-04"
---
Squashes any real number into (0, 1) via 1/(1+e^-x). The classic [[RXHPrtTB|activation function]] before [[ZS34nG4d|ReLU]].
- The output reads naturally as a probability or a valve setting (0 = closed, 1 = open). That is why [[rK1Dy2Fa|LSTM]] gates use it.
- Saturates at both ends: for large magnitudes the gradient is near 0, which feeds the [[7IHpnRNx|vanishing gradient]] problem in deep nets.
- Still standard for the final unit of binary classification; mostly replaced by [[ZS34nG4d|ReLU]] / [[uuSdeqbX|GELU]] in hidden layers.
