---
slug: pca
uid: "0WlrLnFU"
address: "ML//unsupervised learning//PCA"
name: "PCA"
date: "2026-09-06"
aliases: ["principal component analysis", "explained variance"]
---
Which lower-dimensional linear representation keeps the most variance of the data. **PCA**, principal component analysis, builds a linear subspace oriented along the directions of largest variability. It is a data reduction and analysis method; its foundations are the [[m5zFVv4g|covariance matrix]] and linear algebra.
- Objects before the algorithm. \(X\in\mathbb R^{N\times p}\) holds \(N\) samples in rows and \(p\) variables in columns. Subtracting each variable's mean gives \(X_c\), and the sample covariance is \(\widehat\Sigma=X_c^{\mathsf T}X_c/(N-1)\). Its unit eigenvectors \(v_i\in\mathbb R^p\) are directions of variables; its eigenvalues \(\lambda_1\ge\cdots\ge\lambda_p\ge0\) are variances along them.
- Represent and reconstruct. With \(U_r=[v_1\;\cdots\;v_r]\),

{math}
A=X_cU_r,\qquad \widehat X=X_cU_rU_r^{\mathsf T}+\mathbf1\mu^{\mathsf T}.
{/math}

The rows of \(A\) are the reduced coordinates of the samples. The **cumulative explained variance** is \(\sum_{i\le r}\lambda_i/\sum_{i\le p}\lambda_i\) when the total variance is nonzero. In the population formulation the expected squared reconstruction error equals the sum of the discarded eigenvalues. This optimality concerns orthogonal linear projections and that metric, not any engineering objective ([[Vp8NyXtD|projection]]).
- What the user of the method decides. Centering and standardizing are not the same. If a variable changes from meters to millimeters, PCA on the covariance can favor it by scale; standardizing gives a correlation-based geometry but can amplify low-variability variables dominated by noise. The number of components depends on purpose: keeping 90 % of the variance does not mean keeping 90 % of the diagnostic, causal or predictive information ([[PiXdy5JI|variance]]). The worked case is [[vpwD3eD3|redundant sensors]].
- What must not be read as dynamics. Principal components are not automatically vibration modes or Jacobian eigenvectors of the plant. They describe the dataset and its scale. A time series can be fed to PCA, but computing a covariance does not model the time order ([[Xevpd3GQ|modes]]).
- [[iRDhDtGq|spectral clustering]] uses eigenvectors of a graph of samples for a different purpose; [[9ELAQ3ap|K-means]] can run on PCA coordinates, but grouping is another operation.
- Reference: [Shalizi, Principal Components Analysis, chapter 16 of the data-analysis notes](https://www.stat.cmu.edu/~cshalizi/uADA/16/lectures/17.pdf)

## Interactions

- [[dr9Kx5mW|dimensionality reduction]] : : The dimensionality reduction note lists PCA as one technique; this note pins down the exact criterion it optimizes, retained variance, and why that is not the same as retained information
- [[Cx7mT5nQ|curse of dimensionality]] : : PCA is the standard first answer to the curse of dimensionality, and it only works when the variance that matters is concentrated in a few linear directions
