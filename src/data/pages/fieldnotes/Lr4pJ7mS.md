---
uid: "Lr4pJ7mS"
address: "ML//neural network//optimizer//learning rate"
name: "Learning Rate"
date: "2026-03-05"
---
The step size for [[Gd5tR8wP|gradient descent]]: how much to adjust weights per update. Too high and training diverges (loss explodes), too low and it takes forever or gets stuck in shallow minima.
- The single most important hyperparameter in all of deep learning. Everything else (architecture, data, [[j9Y9JsUA|optimizer]]) matters, but a wrong learning rate can make the best setup fail completely.

##### Schedules

- Warmup: start with a tiny learning rate and increase linearly for the first 1-5% of training. Without warmup, early gradients are noisy (random weights) and large steps destabilize training. [[OEOSluOX|Adam]]'s adaptive moments partially mitigate this, but warmup still helps.
- Cosine decay: after warmup, decrease the learning rate following a cosine curve down to near zero. This lets the model make large exploratory steps early, then fine-grained adjustments late. The standard schedule for [[2oNdlB5L|pre-training]] large models.
- [[iTljPiGW|Scaling laws]] interact directly: as you scale batch size, you typically scale the learning rate proportionally (linear scaling rule). [[kJfQz2vH|Distributed training]] across more GPUs means larger effective batch size, which means adjusting the schedule.
- For [[esHo5jMx|fine-tuning]], the learning rate is typically 10-100x smaller than pre-training. The model's weights are already near a good solution; large steps would destroy what it learned. This is why [[3kgsj4Y4|LoRA]] works: it adds small trainable deltas instead of updating all weights with a small learning rate.

## Interactions

- [[OEOSluOX|Adam]] : : Adam adapts the effective learning rate per-parameter using momentum and second moments. The "learning rate" you set is really a maximum step size that Adam scales down based on gradient history
