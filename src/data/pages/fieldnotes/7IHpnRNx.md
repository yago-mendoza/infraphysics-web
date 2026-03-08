---
uid: "7IHpnRNx"
address: "ML//neural network//vanishing gradient"
name: "Vanishing Gradient"
date: "2018-03-08"
---
- Gradients shrink exponentially through deep layers — chain rule multiplies many small numbers.
- Why deep nets couldn't train before [[0WgYCyiZ|ResNet]] skip connections.
- Why [[mBCcy7bn|RNNs]] couldn't handle long sequences before [[rK1Dy2Fa|LSTM]] gates — the hidden state carries "memory" from previous steps, but information from the beginning dilutes exponentially.
- The fundamental reason we don't save enriched [[haA3MDhG|embeddings]] as persistent state: that's exactly what RNNs did, and the hidden state corrupted over time.
