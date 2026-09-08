---
uid: "Fv6tR3nQ"
address: "ML//neural network//loss landscape//flat vs sharp minima"
name: "flat vs sharp minima"
date: "2026-03-11"
---
A flat minimum is a region of the [[Lk7mT3nQ|loss landscape]] where loss stays low across a wide range of weight configurations. A sharp minimum is a narrow valley where loss rises steeply with small weight perturbations.

The hypothesis: flat minima generalize better because they tolerate the small differences between training and test data. A model sitting in a sharp minimum is fragile; tiny distribution shifts push it up the walls. A model in a flat minimum barely notices.

The evidence is mixed. Dinh et al. (2017) showed that sharpness can be manipulated by reparameterization without changing generalization, arguing the connection is not as clean as it seems. Other work (Jiang et al., 2019) found that flatness correlates well with generalization when measured correctly. The practical consensus leans toward flat being better.

Small batch sizes tend to find flat minima (the noise in small batches acts as implicit [[tMlQ2MGK|regularization]], bouncing the optimizer out of sharp valleys). Large batch sizes converge to sharper minima.

## Interactions

- [[obTC4dWy|Overfitting]] : : sharp minima correlate with overfitting; the model has memorized a narrow configuration that works for training data but breaks on anything slightly different
- [[Bn8xR7wP|Batch Normalization]] : : batchnorm introduces noise through its batch statistics calculations, which may help the optimizer avoid sharp minima and find flatter, more generalizable regions
