---
uid: "PcpT01xa"
address: "ML//neural network//perceptron"
name: "Perceptron"
date: "2026-07-04"
---
The original single-neuron classifier (Rosenblatt, 1958). Weights each input, sums, adds a bias, and thresholds.
- Computes z = w·x + b, then fires 1 if z clears a threshold, else 0. Geometrically it draws a single hyperplane: one side "yes", the other "no".
- Learns by nudging weights toward less-wrong after each mistake, the seed of all [[Gd5tR8wP|gradient descent]] training.
- Hard ceiling: one hyperplane only separates linearly separable data (it cannot learn XOR). The fix is stacking neurons into a [[YrmsQuhU|neural network]].
