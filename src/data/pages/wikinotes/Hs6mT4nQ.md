---
uid: "Hs6mT4nQ"
address: "Math//Hessian"
name: "Hessian"
date: "2026-03-11"
---
A square matrix of second-order partial derivatives of a scalar function. If a function has *n* parameters, its Hessian is an *n x n* matrix where entry (i,j) is the second derivative with respect to parameters *i* and *j*. It captures the curvature of the function at a given point.

In deep learning, the Hessian of the [[DxaRVjHg|loss function]] describes the local curvature of the [[Lk7mT3nQ|loss landscape]]. Its [[Ev3kM5nQ|eigenvalues]] reveal whether a critical point is a [[Vn3kM7nQ|minimum]] (all positive), a maximum (all negative), or a [[Sp5mK8cJ|saddle point]] (mixed).

The Hessian of a neural network is impractically large (for a model with 175 billion parameters, the Hessian would be a 175B x 175B matrix). In practice, only the extreme eigenvalues are computed (using iterative methods like Lanczos), which is enough to characterize the local geometry.
