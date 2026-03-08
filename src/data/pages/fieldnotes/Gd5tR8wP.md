---
uid: "Gd5tR8wP"
address: "ML//neural network//gradient descent"
name: "Gradient Descent"
date: "2026-03-07"
---
The optimization algorithm that makes neural networks learn: compute how wrong the model is ([[DxaRVjHg|loss function]]), compute which direction to adjust each weight ([[aufHHy2p|backpropagation]]), then nudge weights in that direction.
- The "gradient" is a vector of partial derivatives, one per parameter. It points toward steeper loss. You move in the opposite direction (downhill) by a small step called the [[Lr4pJ7mS|learning rate]]
- Pure gradient descent uses the entire dataset per update (impractical). SGD (stochastic gradient descent) uses one sample. Mini-batch SGD uses a batch (typically 32-4096 samples), balancing noise and efficiency.
- Why it works despite non-convex landscapes: modern networks have so many parameters that most local minima are roughly equivalent in quality. The real danger is saddle points (flat regions), not bad minima.
- [[OEOSluOX|Adam]] is the dominant [[j9Y9JsUA|optimizer]] because it adapts the learning rate per-parameter using momentum (running average of gradients) and second moments (running average of squared gradients). It handles sparse gradients and varying scales automatically.
- [[7IHpnRNx|Vanishing gradient]] is what happens when gradients shrink exponentially through deep layers. [[dTnuW5yO|Residual connections]] fix this by providing a gradient highway that bypasses layers.
- At massive scale, gradient descent requires [[kJfQz2vH|distributed training]]: split the batch across GPUs, compute gradients in parallel, synchronize. The math is the same, the engineering is the hard part.

## Interactions

- [[iTljPiGW|Scaling Laws]] : : Scaling laws describe what happens when you scale gradient descent: more data, more parameters, more compute. The loss follows predictable power laws regardless of architecture details
