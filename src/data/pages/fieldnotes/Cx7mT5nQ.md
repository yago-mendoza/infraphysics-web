---
uid: "Cx7mT5nQ"
address: "Math//curse of dimensionality"
name: "curse of dimensionality"
date: "2026-03-11"
---
The phenomenon where the volume of a space grows so fast with the number of dimensions that available data becomes sparse. In 1 dimension, 10 data points cover a lot of ground. In 100 dimensions, 10 data points are lost in a void.

Consequences: distances between points become nearly uniform (everything is "far" from everything else), density estimation requires exponentially more data, and models trained in high-dimensional spaces are prone to [[obTC4dWy|overfitting]] because they can memorize sparse data without learning generalizable patterns.

The curse applies primarily to the data space, not to the parameter space. In overparameterized neural networks, the parameter space exhibits the opposite effect: the [[Bx4nK9wP|blessing of dimensionality]], where more dimensions create more paths to good solutions. The distinction matters: when people say "deep learning shouldn't work because of the curse of dimensionality," they are applying a data-space intuition to a weight-space phenomenon.
