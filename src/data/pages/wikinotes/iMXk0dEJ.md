---
uid: "iMXk0dEJ"
address: "ML//Inference//Sampling//top-k"
name: "Top-K"
date: "2020-10-15"
---
Top-k sampling keeps only the \(k\) highest-probability next tokens, renormalizes their probabilities, and samples from that reduced set. At \(k=1\) it becomes greedy decoding.

- It removes improbable tail tokens with constant computational logic, but a fixed \(k\) ignores whether the model is certain or confused.
- In a sharp distribution, \(k=50\) may admit junk; in a flat distribution it may discard plausible alternatives. [[9Tlb16K2|Top-p]] adapts the candidate count to the probability mass instead.

Top-k is best understood as a hard vocabulary budget per decoding step, not a universal creativity dial.
