---
uid: "Sp5mK8cJ"
address: "ML//neural network//loss landscape//saddle point"
name: "saddle point"
date: "2026-03-11"
---
A point in the [[Lk7mT3nQ|loss landscape]] where the gradient is zero but the point is neither a minimum nor a maximum. The surface curves downward in some directions and upward in others, like the center of a horse saddle.

In high-dimensional spaces, saddle points vastly outnumber true [[Vn3kM7nQ|local minima]]. A point is a local minimum only if curvature is positive in *every* dimension; a saddle point only needs one negative curvature direction. With millions of dimensions, the probability that all curvatures happen to be positive is vanishingly small.

Mathematically, saddle points are identified by the [[Hs6mT4nQ|Hessian]] matrix having a mix of positive and negative [[Ev3kM5nQ|eigenvalues]]. Modern optimizers like Adam handle saddle points better than vanilla SGD because their momentum terms carry them through flat regions where the gradient is near zero.

## Interactions

- [[Vn3kM7nQ|minima]] : : in high dimensions, what looks like a local minimum from a low-dimensional projection is often a saddle point; true local minima require positive curvature in every dimension simultaneously, which is exponentially unlikely
