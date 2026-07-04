---
uid: "Ft9pL5hS"
address: "ML//neural network//feature"
name: "Feature"
date: "2026-03-05"
---
A direction in activation space that represents a concept: "Michael Jordan", "basketball", "plural", "code syntax".
- [[Pr8dt3wz|MLP layers]] detect and add features: if the current [[haA3MDhG|embedding]] aligns with a feature direction above threshold ([[ZS34nG4d|ReLU]]), that feature gets added.
- Example: if a vector already points toward "Michael" and "Jordan", the MLP adds the "basketball" direction.
- Features can be distributed across neurons ([[Sp2tK6jL|superposition]]) or clean ([[Mn7cR3xF|monosemantic]])
- [[Sa4vB8mQ|Sparse autoencoders]] try to extract the clean feature set from superposed activations.
- Features are directions, not neurons. A single neuron might participate in many features.
