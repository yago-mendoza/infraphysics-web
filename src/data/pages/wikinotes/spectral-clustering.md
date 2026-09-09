---
slug: spectral-clustering
uid: "iRDhDtGq"
address: "ML//unsupervised learning//spectral clustering"
name: "spectral clustering"
date: "2026-09-06"
aliases: ["normalized cut", "Ncut", "affinity graph"]
---
How to turn local relations into coordinates that allow grouping. **Spectral clustering** groups using eigenvectors of a matrix built from relations between samples. It does not avoid defining similarity: it moves that decision into a graph and then represents the graph's connectivity patterns.
- Building the graph is part of the model. Each sample \(x_i\) is a node. A common affinity for \(i\ne j\) is

{math}
w_{ij}=\exp\!\left(-\frac{\|x_i-x_j\|^2}{2\sigma^2}\right),\qquad w_{ii}=0,
{/math}

possibly restricted to nearby neighbors. \(\sigma\) sets a similarity scale; the number of neighbors sets local connectivity; a neighbor graph needs a symmetrization rule before an undirected Laplacian is used. A large raw distance must not represent a strong affinity ([[YRGQ0acp|adjacency and degree]]). Neither \(K\) nor the number of neighbors has a universal value: too few connections fragment a group, too many merge distinct regions.
- One concrete variant, recipes not mixed. For the symmetric normalized variant, form \(D\) and \(L_{\mathrm{sym}}=I-D^{-1/2}WD^{-1/2}\), after handling isolated nodes ([[5b5LCoKr|normalized Laplacian]]). Take \(K\) orthonormal eigenvectors of the smallest eigenvalues, the trivial mode included, as columns of \(U\in\mathbb R^{N\times K}\). Normalize each nonzero row to unit length; a zero row calls for revisiting components and the number of vectors, not dividing by zero. Apply [[9ELAQ3ap|K-means]] to those rows and carry the labels back to the samples. This is the Laplacian-based form of the Ng, Jordan and Weiss recipe, whose original operator uses the normalized affinity and the largest eigenvalues. Other variants use \(L_{\mathrm{rw}}\) or the problem \(Lv=\lambda Dv\); their transformations and row normalizations must not be mixed casually.
- Why the modes separate communities. With \(K\) disconnected components the null space has dimension \(K\) and its patterns identify the components; in the symmetric version, row normalization removes degree-induced magnitude differences within each component. With weak connections, low-disagreement patterns appear that distinguish regions well connected inside and poorly outside ([[kRgRUf2W|spectral gap]]). The random walk supplies the reading of long stays ([[4lWVJGgV|stationary distribution]]).
- Which partition is favored. For a node set \(S\), \(\operatorname{cut}(S,\bar S)=\sum_{i\in S,j\notin S}w_{ij}\) and \(\operatorname{vol}(S)=\sum_{i\in S}d_i\). The **normalized cut** is

{math}
\operatorname{Ncut}(S,\bar S)=\frac{\operatorname{cut}(S,\bar S)}{\operatorname{vol}(S)}+\frac{\operatorname{cut}(S,\bar S)}{\operatorname{vol}(\bar S)}.
{/math}

It favors regions with few external connections relative to their total connectivity. The spectral problem is a relaxation of partition objectives; discretizing through K-means does not guarantee the combinatorial optimum.
- Caveats that must travel with the intuition. Normalizing by degree does not remove every density effect. Eigenvectors are not attractors. The diffusion "time" of a data graph is not automatically the physical time of the process. Cutting by the sign of a single vector is a heuristic for some two-group problems, not the general algorithm. [[5Gsj9whS|spectral coordinates]] distinguishes columns from rows; [[ZSEkGNUs|two-community graph]] works an exact case.
- References: [von Luxburg, A Tutorial on Spectral Clustering (2007), section 6](https://arxiv.org/abs/0711.0189); [Ng, Jordan and Weiss, On Spectral Clustering: Analysis and an Algorithm (NIPS 2001), section 2](https://papers.nips.cc/paper_files/paper/2001/file/801272ee79cfde7fa5960571fee36b9b-Paper.pdf); [Spielman, Spectral Graph Theory, lecture 1, sections 1.5 and 1.6](https://www.cs.yale.edu/homes/spielman/561/lect01-18.pdf)

## Interactions

- [[9ELAQ3ap|K-means]] : : K-means optimizes compactness around centroids in the given coordinates; spectral clustering changes the coordinates first so that connectivity, not distance to a center, defines the groups. K-means is still the last step
