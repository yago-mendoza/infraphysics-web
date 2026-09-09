---
slug: stationary-distribution
uid: "4lWVJGgV"
address: "mathematics//probability//Markov chain//stationary distribution"
name: "stationary distribution"
date: "2026-09-06"
aliases: ["mixing", "metastability", "detailed balance", "ergodicity"]
---
What it means for the probabilities to settle, and what can prevent that convergence. A **stationary distribution** for a row-stochastic matrix satisfies

{math}
P^{\mathsf T}\pi=\pi,\qquad \pi_i\ge0,\quad\sum_i\pi_i=1.
{/math}

It is a right eigenvector of \(P^{\mathsf T}\), a left eigenvector of \(P\), for eigenvalue one. Starting the chain there keeps the distribution at every step. The objects can keep moving: stationarity is not individual immobility.
- Existing is not the same as attracting. In a finite **irreducible** chain every state communicates with every other through positive-probability walks, and a unique positive stationary distribution exists. Converging to it from any initial distribution in discrete time needs **aperiodicity** as well: the greatest common divisor of the return lengths must be one. The chain

{math}
P=\begin{bmatrix}0&1\\1&0\end{bmatrix}
{/math}

has stationary distribution \((1/2,1/2)^{\mathsf T}\), yet a distribution concentrated on one node alternates forever. In a reducible chain several closed classes can exist and the final distribution can depend on the start; a class can be absorbing. "Ergodic" has competing conventions, so finiteness, irreducibility and aperiodicity are stated explicitly whenever convergence of distributions is needed.
- The distribution of a walk on a graph. For \(W=W^{\mathsf T}\) and \(P=D^{-1}W\), a stationary distribution is \(\pi_i=d_i/\sum_jd_j\). The check is \(\pi_iP_{ij}=w_{ij}/\sum_\ell d_\ell=\pi_jP_{ji}\): **detailed balance**, the equilibrium exchange compensating edge by edge. Higher-degree nodes have higher stationary occupation, so normalizing transitions produces neither a uniform distribution nor freedom from degree effects ([[5b5LCoKr|normalized Laplacian]]).
- Mixing and metastability. **Mixing** describes the approach of the distribution to the stationary one. **Metastability** describes a long stay in a region before escaping, for example two communities well connected inside and weakly between them. A metastable community is not an absorbing attractor: it can be left. The intuition serves spectral clustering, but its usefulness depends on how the graph was built ([[ZSEkGNUs|two-community graph]]).
- The [[kRgRUf2W|spectral gap]] relates mixing to the spectrum; [[4cU0TSmY|diffusion and consensus]] explains why a non-uniform distribution coexists with constant consensus of the dual operator.
- Reference for existence, uniqueness and the convergence theorem: [Levin and Peres, Markov Chains and Mixing Times, theorem 4.9](https://pages.uoregon.edu/dlevin/MARKOV/markovmixing.pdf)
