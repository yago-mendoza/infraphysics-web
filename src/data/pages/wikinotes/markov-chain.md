---
slug: markov-chain
uid: "HF547EI2"
address: "mathematics//probability//Markov chain"
name: "Markov chain"
date: "2026-09-06"
aliases: ["transition matrix", "random walk", "stochastic matrix"]
---
How a distribution over states evolves when the transition probabilities are known. A **finite Markov chain** describes a random state \(S_k\) that belongs to a list of possibilities. Its distribution \(p_k\) is a different object: \(p_{k,i}=\Pr(S_k=i)\). One individual system occupies one state; the vector represents our uncertainty or the proportions of a population.
- One convention for all these notes. Define

{math}
P_{ij}=\Pr(S_{k+1}=j\mid S_k=i),\qquad P_{ij}\ge0,\qquad\sum_jP_{ij}=1.
{/math}

\(P\) is **row-stochastic**. Since distributions are written as columns,

{math}
p_{k+1}=P^{\mathsf T}p_k,\qquad p_k=(P^{\mathsf T})^k p_0.
{/math}

With row distributions one writes \(p_{k+1}^{\mathsf T}=p_k^{\mathsf T}P\). Both conventions are valid. Mixing \(P=D^{-1}W\) with \(p_{k+1}=Pp_k\) for a column generally is not.
- A checkable example.

{math}
P=\begin{bmatrix}0.9&0.1\\0.2&0.8\end{bmatrix},\qquad p_0=\begin{bmatrix}1\\0\end{bmatrix}.
{/math}

After one step \(p_1=(0.9,0.1)^{\mathsf T}\); after two, \(p_2=(0.83,0.17)^{\mathsf T}\). \((P^k)_{ij}\) is the probability of ending in \(j\) after \(k\) steps having started in \(i\): it sums every allowed intermediate walk ([[YRGQ0acp|adjacency and degree]]). If \(N\) objects follow these probabilities, the expected counts obey the same linear evolution while the observed counts fluctuate. Nobody claims one object sits in every node at once.
- From graph to walk. With non-negative weights and \(d_i>0\), \(P=D^{-1}W\) picks neighbors in proportion to their weights. The operator \(Px\) averages a **function on nodes**; \(P^{\mathsf T}p\) transports a **column distribution**. Dual actions, not interchangeable meanings ([[5b5LCoKr|normalized Laplacian]]).
- Continuous time. A row generator \(Q\) has non-negative off-diagonal entries and zero row sums, and probabilities satisfy \(\dot p=Q^{\mathsf T}p\); for example \(Q=\nu(P-I)\) with a rate \(\nu>0\). A per-step transition and a generator are related but not the same object ([[SQo89ykf|discretization]]).
- The memory condition that makes the chain well defined is the Markov property of a [[u18hGtFd|sufficient state]]. The long run belongs to the [[4lWVJGgV|stationary distribution]].
- Convention and theory reference: [Levin and Peres, Markov Chains and Mixing Times, 2nd edition, chapter 1](https://pages.uoregon.edu/dlevin/MARKOV/markovmixing.pdf)

## Interactions

- [[4cU0TSmY|diffusion and consensus]] : : Same matrix family, dual questions: consensus averages node values with P, the chain transports a distribution with its transpose. Consensus reaches a constant vector; the walk reaches a non-uniform occupation
