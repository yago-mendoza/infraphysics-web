---
slug: covariance-matrix
uid: "m5zFVv4g"
address: "mathematics//statistics//covariance matrix"
name: "covariance matrix"
date: "2026-09-06"
aliases: ["quadratic form", "positive semidefinite"]
---
How one matrix describes variability in every direction. Let \(X\in\mathbb R^p\) be a random vector of measured variables with mean \(\mu\). The **covariance matrix** is

{math}
\Sigma=\mathbb E[(X-\mu)(X-\mu)^{\mathsf T}],\qquad \Sigma_{ij}=\operatorname{Cov}(X_i,X_j).
{/math}

The diagonal holds variances, the off-diagonal [[G8apPDCM|covariances]]. It is symmetric and positive semidefinite even though some entries may be negative.
- The transpose closes a scalar measure. For a combination \(Y=a^{\mathsf T}(X-\mu)\), \(\operatorname{Var}(Y)=a^{\mathsf T}\Sigma a\). \(\Sigma a\) is a vector; \(a^{\mathsf T}\Sigma a\) a scalar. It is not "multiply by the transpose" and nothing more: the first vector sets the combination and the second closes the quadratic form. If \(\Sigma v_i=\lambda_i v_i\) with \(\|v_i\|_2=1\), then \(\operatorname{Var}(v_i^{\mathsf T}X)=\lambda_i\): that is the statistical reading of the [[Ev3kM5nQ|eigenvalues]] ([[Xevpd3GQ|modes]]).
- A small example.

{math}
\Sigma=\begin{bmatrix}5&4\\4&5\end{bmatrix}.
{/math}

The common mode \(v_+=(1,1)^{\mathsf T}/\sqrt2\) has variance 9; the difference mode \(v_-=(1,-1)^{\mathsf T}/\sqrt2\) has variance 1. The variables fluctuate mostly together and their difference varies less. Nothing says the difference decays exponentially: this is not an evolution matrix.
- The real bridge to the Laplacian. \(\Sigma\) and \(L\) share the algebraic structure of a symmetric positive semidefinite matrix. Their quadratic forms answer different questions: \(a^{\mathsf T}\Sigma a\) is the variance of a combination, \(x^{\mathsf T}Lx\) the disagreement over edges ([[4tV2QGXX|graph Laplacian]]). A covariance is not automatically a Laplacian: its rows need not sum to zero and its cross entries do not carry the standard Laplacian signs. Turning it into an affinity requires another rule.
- Units and preparation. \(\Sigma_{ij}\) has units \([X_i][X_j]\). Mixing pressures and temperatures makes the Euclidean geometry depend on the choice of units. Centering subtracts means; standardizing divides by standard deviations. Different operations, and they change which variations [[0WlrLnFU|PCA]] favors. The worked case is [[vpwD3eD3|redundant sensors]].
- Reference for the directional-variance identity: [Shalizi, Principal Components Analysis, section 16.1](https://www.stat.cmu.edu/~cshalizi/uADA/16/lectures/17.pdf)
