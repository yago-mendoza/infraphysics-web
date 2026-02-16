---
uid: "Pr11SIS0"
address: "ML//Inference//Sampling//temperature"
name: "temperature"
date: "2020-10-15"
---
- Scales logits before softmax: logits / T
- T=0: greedy (always pick highest probability). T=1: raw distribution. T>1: more random.
- The simplest generation knob. Low temperature for factual tasks, high for creative ones.
