---
uid: "OEOSluOX"
address: "ML//neural network//optimizer//Adam"
name: "Adam"
date: "2018-01-05"
---
Adam combines an exponential moving average of gradients with an exponential moving average of squared gradients, producing an adaptive update scale for each parameter.

- The first moment behaves like momentum; the second normalizes coordinates with persistently different gradient magnitudes. Bias correction matters early, when both averages still begin near zero.
- AdamW decouples weight decay from the adaptive gradient update. That distinction is easy to hide in an optimizer flag and can materially change regularization.
- Adam often reaches a useful solution quickly and tolerates rough scaling better than plain SGD, which makes it a strong default—not a theorem. Memory cost, final generalization, batch regime, and architecture can favor other optimizers.
