---
uid: "Ev3kM5nQ"
address: "Math//eigenvalue"
name: "eigenvalue"
date: "2026-03-11"
---
A scalar that captures a fundamental property of a matrix. For a square matrix A, an eigenvalue \(\lambda\) is a number such that there exists a nonzero vector *v* (the eigenvector) where A*v* = \(\lambda\)*v*. The matrix stretches the eigenvector by a factor of \(\lambda\) without changing its direction.

Eigenvalues extract the essential character of a matrix without requiring the full matrix to be computed or stored. In deep learning, the eigenvalues of the [[Hs6mT4nQ|Hessian]] reveal the curvature of the [[Lk7mT3nQ|loss landscape]]: positive eigenvalues indicate convex (bowl-shaped) curvature, negative eigenvalues indicate concave curvature, and a mix of both identifies [[Sp5mK8cJ|saddle points]].

Used across many fields: image compression (discard small eigenvalues, keep the ones that carry most information), quantum mechanics (energy levels of a system are eigenvalues of the Hamiltonian), stability analysis (eigenvalues of the Jacobian determine whether a system is stable).
