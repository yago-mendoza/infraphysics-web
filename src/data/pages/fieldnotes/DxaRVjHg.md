---
uid: "DxaRVjHg"
address: "ML//neural network//loss function"
name: "Loss Function"
date: "2017-10-22"
---
A loss function turns a prediction and target into an optimization signal. Training minimizes its aggregate value through [[aufHHy2p|backpropagation]], but the loss is a chosen proxy for desired behavior—not an objective measurement of how wrong the system is.

- [[q3MjogvW|Cross-entropy]] is common for classification and next-token prediction; squared error is common for regression.
- The loss determines which mistakes look equivalent to the optimizer. If an important real-world cost is absent or badly weighted, the model has no gradient telling it to care.
- Evaluation metrics and training losses serve different jobs: the metric describes success, while the loss must also provide a useful, differentiable learning landscape.

Choosing a loss is therefore a small act of governance: it translates human priorities into geometry.
