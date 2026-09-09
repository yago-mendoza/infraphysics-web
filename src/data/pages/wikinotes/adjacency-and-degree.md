---
slug: adjacency-and-degree
uid: "YRGQ0acp"
address: "mathematics//graph theory//adjacency and degree"
name: "adjacency and degree"
date: "2026-09-06"
aliases: ["adjacency matrix", "weighted graph", "degree matrix"]
---
What structure a network keeps before any law of evolution is chosen. A **graph** is nodes and edges. Nodes can be tanks, sensors, states of a Markov chain or data samples. Edges are a relation defined for the problem: a pipe, a dependence, an allowed transition or a similarity. The **topology** says which connections exist; the **weights** add intensity. Neither decides on its own what quantity evolves or under which law.
- Weight matrix and degree. For an undirected network with non-negative weights and no self-loops,

{math}
W_{ij}=W_{ji}\ge0,\quad W_{ii}=0,\qquad d_i=\sum_jW_{ij},\qquad D=\operatorname{diag}(d_i).
{/math}

\(W\) is the **weighted adjacency** and \(D\) holds the **weighted degrees**. With unit weights the degree counts neighbors; with conductances it sums conductances; with affinities it sums similarities, which does not make it a physical capacity.
- Powers count walks, not just direct connections: \((W^2)_{ij}=\sum_\ell W_{i\ell}W_{\ell j}\). In a binary adjacency, \((W^k)_{ij}\) counts **walks of length \(k\)**, allowing repeated nodes and edges; it does not count only simple paths. With weights it sums products of weights along those walks. For a [[HF547EI2|transition matrix]] the same multiplication sums probabilities of compatible alternatives: same algebra, different meaning of the entries.
- Direction needs a convention. In a directed transport graph, \(W_{ij}\) can be the weight of the transition from \(i\) to \(j\). But in \(\dot x_i=\sum_jw_{ij}(x_j-x_i)\) the coefficient \(w_{ij}\) means that \(i\) uses the value of \(j\): the dynamic dependence goes from \(j\) to \(i\). Arrows cannot be carried between transport and dependence without revisiting the indices. A symmetric network hides this ambiguity; a directed one exposes it.
- Affinity is not distance. To group data, a large weight usually means **similarity**, not separation. A large distance must not become a strong edge as is; it can be transformed through a decreasing function, as [[iRDhDtGq|spectral clustering]] does.
- The [[4tV2QGXX|graph Laplacian]] converts connections into local differences. [[u38TIs0J|Coupling]] interprets dynamic dependencies. A statistical association ([[G8apPDCM|covariance]]) is not automatically a causal edge.
