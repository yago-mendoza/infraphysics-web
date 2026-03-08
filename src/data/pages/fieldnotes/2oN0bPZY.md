---
uid: "2oN0bPZY"
address: "Information Theory//channel capacity"
name: "Channel Capacity"
date: "2026-03-06"
---
The maximum rate at which information can be transmitted reliably through a noisy channel — Shannon's most famous result (1948)
- Formula (Shannon-Hartley): \(C = B \log_2(1 + S/N)\) where \(B\) is bandwidth, \(S/N\) is signal-to-noise ratio.
- The noisy-channel coding theorem: if you transmit below capacity, codes exist that make error probability arbitrarily small. Above capacity, errors are inevitable regardless of coding scheme.
- Analogy to ML models: a model has a "capacity" — the complexity of functions it can represent. A model too small for the task will always make errors, like transmitting above channel capacity. [[iTljPiGW|Scaling laws]] are empirical measurements of this capacity.
- Analogy to [[Et5mN8wJ|extended thinking]]: thinking tokens are like increasing bandwidth — more compute per problem means more capacity to reduce [[JsSUul6f|entropy]]. But there is a ceiling set by [[2oNdlB5L|pretraining]] (the channel itself), and no amount of extra thinking surpasses it.
- The capacity is a property of the channel, not the message. Similarly, a model's ceiling is set by its architecture and pretraining, not by the prompt or thinking budget.

## Interactions

- [[avUhQygt|Information Theory]] : : Channel capacity is Shannon's central theorem — the upper bound on reliable communication through any noisy channel
- [[iTljPiGW|Scaling Laws]] : : Scaling laws are empirical measurements of model capacity — how performance scales with parameters, data, and compute, analogous to how channel capacity scales with bandwidth and SNR
