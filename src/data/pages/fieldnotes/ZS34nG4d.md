---
uid: "ZS34nG4d"
address: "ML//neural network//activation function//ReLU"
name: "ReLU"
date: "2017-12-03"
---
- max(0, x) — dead simple. The threshold gate in [[Pr8dt3wz|MLP layers]]
- Solved the [[7IHpnRNx|vanishing gradient]] problem for deep nets: gradient is either 0 or 1, never shrinks.
- In transformers: acts as a [[Ft9pL5hS|feature]] compatibility threshold — if the input aligns with a feature direction above zero, that feature fires. Below zero, it's suppressed.
- "Dead neurons" downside: once a unit goes negative, it never recovers. [[uuSdeqbX|GELU]] is the modern fix (smooth approximation)
