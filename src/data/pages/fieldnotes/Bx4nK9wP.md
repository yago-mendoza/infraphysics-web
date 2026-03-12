---
uid: "Bx4nK9wP"
address: "ML//neural network//loss landscape//blessing of dimensionality"
name: "blessing of dimensionality"
date: "2026-03-11"
---
The counterintuitive finding that as neural networks grow larger (more parameters, more dimensions in the [[Lk7mT3nQ|loss landscape]]), optimization gets *easier*, not harder. From any random starting point, there is almost certainly a local path to a good minimum nearby.

The intuition: in an overparameterized network (millions of parameters, thousands of data points), the set of weight configurations that interpolate the training data is enormous. The "needles in the haystack" are so numerous that it is hard *not* to land near one. [[Gd5tR8wP|Gradient descent]] only needs to find a nearby solution, and high dimensionality guarantees there is one close.

Babak Hassibi (Caltech) formalizes this: the larger the network, the larger the subspace of good solutions, and the more likely any random initialization is close to one. This explains why overparameterized networks generalize instead of overfitting (they should overfit in theory; in practice, the geometry of the high-dimensional space prevents it, especially when combined with implicit regularization from SGD).

The opposite is the [[Cx7mT5nQ|curse of dimensionality]], which applies to data (more dimensions make data sparse) rather than to the weight space of neural networks.

## Interactions

- [[Cx7mT5nQ|curse of dimensionality]] : : the blessing applies to the weight space of overparameterized networks (more dimensions make optimization easier); the curse applies to data space (more dimensions make data sparser and models harder to train without enough samples). same mathematical spaces, opposite effects depending on what lives in them
