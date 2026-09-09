---
slug: spectral-gap
uid: "kRgRUf2W"
address: "mathematics//graph theory//spectral gap"
name: "spectral gap"
date: "2026-09-06"
aliases: ["algebraic connectivity", "Fiedler value", "diffusion modes"]
---
Which patterns disappear fast and which reveal weak connections. For a symmetric Laplacian of a connected network,

{math}
0=\lambda_1<\lambda_2\le\cdots\le\lambda_n,\qquad Lv_i=\lambda_i v_i.
{/math}

The mode \(v_1\) is constant. In \(\dot x=-Lx\) each mode evolves as \(c_i e^{-\lambda_i t}v_i\): the spatial shape is kept and its amplitude shrinks ([[Xevpd3GQ|modes]]).
- Spatial smoothness and temporal speed. For a unit eigenvector,

{math}
\lambda_i=v_i^{\mathsf T}Lv_i=\frac12\sum_{a,b}w_{ab}\bigl(v_i(a)-v_i(b)\bigr)^2.
{/math}

A small eigenvalue is a pattern with small differences across strong connections; it may jump across a weak one. "Smooth" refers to the weighted geometry of the graph, not necessarily to Euclidean closeness of the nodes. A large eigenvalue means more weighted disagreement per unit norm and faster decay **in this continuous dynamics**.
- The gap that governs consensus. \(\lambda_2\) is the **algebraic connectivity** or Fiedler value of the unnormalized Laplacian. For the disagreement with respect to the mean,

{math}
\|x(t)-\bar x\mathbf1\|_2\le e^{-\lambda_2t}\|x(0)-\bar x\mathbf1\|_2.
{/math}

The slow scale is \(1/\lambda_2\) when that rate is in physical units and the mode takes part in the state. With unequal capacities the generalized problem \(Lv=\lambda Mv\) is used, not just the spectrum of \(L\). Absolute values of \(\lambda_2\) must not be compared while ignoring the weight scale: multiplying every weight by a hundred multiplies the rates without changing which nodes are connected.
- The discrete warning. In \(P=I-L_{\mathrm{rw}}\) a mode has per-step factor \(\mu_i=1-\lambda_i\). A \(\mu\) near one is persistent without alternation; a \(\mu\) near minus one is also persistent but alternates in sign. An eigenvalue of \(L_{\mathrm{rw}}\) near two can therefore be a slow alternation in a discrete walk even though that same value gives fast decay in the normalized continuous diffusion. The relevant gap for reversible discrete mixing is \(1-\max_{i\ge2}|\mu_i|\). A **lazy** walk \(P_{\mathrm{lazy}}=(I+P)/2\) adds a probability of staying and removes the bipartite alternation; its eigenvalues then lie in \([0,1]\). See [[SQo89ykf|discretization]].
- The [[5b5LCoKr|normalized Laplacian]] relates the spectra; the [[4lWVJGgV|stationary distribution]] and the mixing of a random walk are the probabilistic reading of persistence; [[iRDhDtGq|spectral clustering]] exploits the separation between scales.
