---
slug: k-means
uid: "9ELAQ3ap"
address: "ML//unsupervised learning//K-means"
name: "K-means"
date: "2026-09-06"
aliases: ["Lloyd's algorithm", "centroid clustering"]
---
How to group points when each group is represented by a center. **K-means** looks for \(K\) centroids and assigns each sample to the closest one, minimizing the sum of squared Euclidean distances:

{math}
\min_{c_1,\ldots,c_K,\;\ell_1,\ldots,\ell_N}\sum_{i=1}^N\|x_i-c_{\ell_i}\|_2^2.
{/math}

\(x_i\) is a sample, \(c_j\) a center and \(\ell_i\) its label. With fixed assignments, the optimal center of a non-empty group is the mean of its points.
- What the usual iteration does. Lloyd's algorithm alternates assigning each point to the nearest center and recomputing centers as means. Each step does not increase the objective, but the full problem is not convex: it can end in different local solutions depending on initialization. Choosing \(K\), handling empty groups and checking stability across initializations are decisions of the method. There is no universal number of groups.
- Why geometry matters. With fixed centroids, the assignment regions are convex Voronoi cells, up to ties on their boundaries. That rule can cut rings, crescents or groups defined by local connections badly. It does not mean every sample of a group must fill a sphere, nor that the method always fails with unequal densities. It means it optimizes quadratic compactness around centroids, not topological continuity of a set.
- Engineering example. Regimes of a motor can be grouped from temperature, vibration and consumption. Scale matters: a numerically large variable can dominate the distance, and normalizing changes which differences count. If the regimes form a curved trajectory in measurement space, [[iRDhDtGq|spectral clustering]] can build another representation before applying K-means; the problem does not vanish by magic, it depends on the graph keeping the relevant relations.
- Grouping is not explaining or controlling. A label does not prove a physical cause nor define a Markov state automatically. Using groups as states of a chain requires checking whether their history adds information and estimating transitions properly ([[u18hGtFd|sufficient state]]).
- [[0WlrLnFU|PCA]] can reduce variables before grouping; [[5Gsj9whS|spectral coordinates]] is another source of coordinates.
