---
uid: "Sa4vB8mQ"
address: "ML//neural network//sparse autoencoder"
name: "Sparse Autoencoder"
date: "2026-03-05"
---
Tool for extracting interpretable [[Ft9pL5hS|features]] from [[Sp2tK6jL|superposed]] neural activations.
- Architecture: encoder expands activations into a much larger (overcomplete) basis, sparsity constraint forces most dimensions to zero, decoder reconstructs.
- The non-zero dimensions in the expanded space correspond to active features — ideally [[Mn7cR3xF|monosemantic]]
- "Dictionary learning" — the autoencoder learns a dictionary of features, activations are sparse combinations of dictionary entries.
- Used in [[UHGnehtS|mechanistic interpretability]] research to peer inside transformer layers.
