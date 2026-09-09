---
slug: projection
uid: "Vp8NyXtD"
address: "mathematics//dimensionality reduction//projection"
name: "projection"
date: "2026-09-06"
aliases: ["subspace projection", "reconstruction error"]
---
When changing coordinates keeps the object and when it compresses it. A **complete invertible change of basis** describes the same vector in other coordinates. A **dimensionality reduction** keeps fewer coordinates or summarizes the object with fewer parameters, and generally loses information ([[dr9Kx5mW|dimensionality reduction]]).
- For a unit direction \(v\) and a centered vector \(x-\mu\), the projected coordinate is \(a=v^{\mathsf T}(x-\mu)\). The scalar \(a\) is not the projected point in the original space; that point is \(\hat x=\mu+av\).
- Projecting onto a subspace. If \(U_r\) holds \(r\) orthonormal columns,

{math}
a=U_r^{\mathsf T}(x-\mu),\qquad \hat x=\mu+U_rU_r^{\mathsf T}(x-\mu).
{/math}

The **residual** \(x-\hat x\) is perpendicular to the subspace. With every vector of an orthonormal basis the reconstruction is exact; keeping only some, the orthogonal part is dropped. "Hyperplane" strictly means an affine subspace of dimension one less than the ambient space; a reduction to arbitrary dimension uses a **subspace** or a low-dimensional representation, not always a hyperplane.
- Which criterion decides what is kept. [[0WlrLnFU|PCA]] keeps the directions of largest variance and minimizes squared reconstruction error among linear subspaces of fixed dimension, for that data scale. [[iRDhDtGq|spectral clustering]] builds coordinates from connectivity; it is not PCA in other notation, and its new axes are not linear combinations of the original variables ([[5Gsj9whS|spectral coordinates]]). In a dynamic model, keeping the slow modes can approximate the long run, but fast modes may matter for transients, actuation or measurement; a reduction by variance does not preserve stability, conservation, controllability or observability by itself ([[u0TgVFYF|controllability and observability]]).
- The engineering example that avoids a bad reduction. If two sensors measure a common temperature, the sum mode can explain almost all the variance while the difference mode, though small, identifies a calibration fault. Discarding it can improve compression and worsen diagnosis ([[vpwD3eD3|redundant sensors]]). The decision to reduce must state its goal: reconstruct signals, detect faults, simulate the long run, design control or group cases. There is no single notion of "relevant information" valid for all of them.
