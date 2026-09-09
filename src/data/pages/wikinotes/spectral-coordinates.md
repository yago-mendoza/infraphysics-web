---
slug: spectral-coordinates
uid: "5Gsj9whS"
address: "mathematics//graph theory//spectral coordinates"
name: "spectral coordinates"
date: "2026-09-06"
aliases: ["spectral embedding", "change of basis"]
---
Decomposing a state into modes and using modes to give coordinates to nodes are two different operations, even though both use eigenvectors. Let \(U=[v_1\;\cdots\;v_n]\) be an orthonormal basis of modes of a symmetric Laplacian.
- Modal coordinates of a state. A vector \(x\in\mathbb R^n\) holds the present value at each node. Its modal coordinates are \(a=U^{\mathsf T}x\), \(x=Ua\). \(a_i\) says how much the mode \(v_i\) takes part in **this state**; when \(x\) changes, its coefficients change. It is a complete change of basis: nothing is lost while every mode is kept. In a non-orthonormal basis the corresponding inverse is used; for eigenvectors \(V\) normalized as \(V^{\mathsf T}MV=I\) the coordinates are \(a=V^{\mathsf T}Mx\) ([[Xevpd3GQ|modes]]).
- Spectral coordinates of a node. Select \(r\) modes and form \(U_r\in\mathbb R^{n\times r}\). The **row** \(i\),

{math}
\xi_i=\bigl(v_1(i),\ldots,v_r(i)\bigr),
{/math}

is a new representation of **node \(i\)**. It does not say how much mode there is in some initial condition: it says what value each selected pattern assigns to that node. Columns are full patterns over all nodes; rows are the new coordinates of each node. This difference is the heart of [[iRDhDtGq|spectral clustering]].
- What depends on a choice. The sign of an eigenvector is arbitrary. For a repeated eigenvalue the basis of its subspace can be rotated. "Positive" and "negative" labels are not physical identities of communities. A common orthogonal rotation of the represented space preserves Euclidean distances and the [[9ELAQ3ap|K-means]] objective; selecting only part of a degenerate subspace or changing scales can alter the geometry. Diffusion maps weight coordinates with temporal factors such as \(\mu_j^k v_j(i)\), favoring the modes that persist at the chosen scale; not every spectral representation carries that weighting.
- Relation and difference with [[0WlrLnFU|PCA]]. In PCA the eigenvectors of a covariance live in the space of measured variables and the samples are projected onto them. In a graph of samples the Laplacian eigenvectors have one component per sample. They share spectral algebra but do not diagonalize the same object nor preserve the same criterion.
- [[dr9Kx5mW|Dimensionality reduction]] is where exact representation and compression part ways; [[ZSEkGNUs|two-community graph]] computes rows and patterns explicitly.
