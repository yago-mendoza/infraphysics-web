---
slug: diffusion-and-consensus
uid: "4cU0TSmY"
address: "mathematics//graph theory//diffusion and consensus"
name: "diffusion and consensus"
date: "2026-09-06"
aliases: ["consensus dynamics", "averaging"]
---
What global behavior comes from reducing local differences. The dynamics \(\dot x=-Lx\) makes each node move toward the values of its neighbors,

{math}
\dot x_i=\sum_jw_{ij}(x_j-x_i).
{/math}

Assume a fixed undirected network, non-negative weights and a time scale that makes the equation dimensionally valid. In physics it can describe diffusion; in distributed algorithms, **consensus**. The shared equation does not erase the difference between the two readings.
- What is conserved and where it ends. Since \(\mathbf1^{\mathsf T}L=0\), the sum of the states stays constant. If the network is connected, \(x(t)\to\bar x\mathbf1\) with \(\bar x=\frac1n\sum_i x_i(0)\). A disconnected network reaches one value per component. With unequal capacities, \(M\dot x=-Lx\) conserves the weighted sum and reaches the weighted average of [[f2KRNCOg|nodal capacity]]. Inputs and boundaries matter too: an imposed temperature or a leak can remove the conservation and change the equilibrium.
- Consensus does not mean attraction to any chosen constant. Every constant state is an equilibrium. A perturbation that changes the mean leads to another constant equilibrium: the consensus family attracts the disagreements, while the common component does not decay. In the subspace of fixed mean there is a single compatible equilibrium and the disagreement modes vanish exponentially. That is the precise sense of "stable" in a conservative network ([[l8kVhz53|equilibrium and stability]]).
- Directed networks. A Laplacian with zero row sums satisfies \(L\mathbf1=0\) even if it is not symmetric. In a strongly connected directed network with non-negative weights the continuous consensus can be

{math}
x(t)\longrightarrow\mathbf1\,\omega^{\mathsf T}x(0),\qquad \omega^{\mathsf T}L=0,\quad \omega^{\mathsf T}\mathbf1=1.
{/math}

The final weighting depends on the left eigenvector and need not be the arithmetic mean. For conservative transport of column quantities the corresponding operator usually acts transposed, as in a [[HF547EI2|Markov chain]]. A check valve is not represented automatically by constant asymmetric weights: \(q_{ij}=k\max(h_i-h_j,0)\) is a piecewise nonlinear law.
- The [[4tV2QGXX|graph Laplacian]] expresses the local action; the [[kRgRUf2W|spectral gap]] gives the collective speed; the [[Gs96QiPq|Lyapunov function]] verifies the loss of disagreement. Consensus of node values is not the same object as a [[4lWVJGgV|stationary distribution]] of occupation.

## Interactions

- [[Fo4opNIG|Consensus]] : : Blockchain consensus is a protocol for agreeing on one discrete history under adversaries; consensus dynamics is an averaging flow that converges by itself. Same word, unrelated mechanisms
