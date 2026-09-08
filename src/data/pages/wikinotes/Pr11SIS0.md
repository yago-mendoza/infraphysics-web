---
uid: "Pr11SIS0"
address: "ML//Inference//Sampling//temperature"
name: "Temperature"
date: "2020-10-15"
---
Scales [[Lg7cD3vX|logits]] before [[Sm8rH4nW|softmax]]: logits / T.
- T=0: greedy (always pick highest probability). T=1: raw distribution. T>1: more random.
- Makes softmax less acute: high T flattens the distribution (more creative), low T sharpens it (more confident)
- The simplest generation knob. Low temperature for factual tasks, high for creative ones.
- The inputs to softmax are called logits, raw pre-normalization scores over the [[Vb8kM2nQ|vocabulary]]
