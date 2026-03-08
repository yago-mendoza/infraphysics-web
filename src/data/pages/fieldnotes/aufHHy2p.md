---
uid: "aufHHy2p"
address: "ML//neural network//backpropagation"
name: "Backpropagation"
date: "2017-09-15"
---
The algorithm that makes neural nets learn — chain rule applied backwards through the graph.
- Compute the gradient of the [[DxaRVjHg|loss function]] with respect to every weight, then nudge each one.
- Forward pass computes the output, backward pass computes all gradients in one sweep.
- In standard [[esHo5jMx|fine-tuning]] and [[YwfNaR4R|DPO]]: touches ALL parameters (attention + MLP). Nothing frozen by default.
- In [[3kgsj4Y4|LoRA]]: gradients only flow through the small adapter matrices — base weights are frozen, backprop skips them.
