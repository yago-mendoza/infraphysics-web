---
slug: dynamical-systems
uid: "kkZ5fiaf"
address: "mathematics//dynamical systems"
name: "dynamical systems"
date: "2026-09-06"
---
How a local law of change becomes collective behavior over time, and how that behavior can be observed, modified, or used to organize data.
- A model states a rule for the rate of change of a state, \(\dot x=f(x,u,t;\theta)\). Everything else ([[PeYZGshp|trajectories]], [[l8kVhz53|equilibria]], [[Xevpd3GQ|modes]], [[5zL83qyU|controllers]]) is derived from that rule plus the hypotheses around it. See [[lfwTGFSW|model and representation]].
- The bridge from one tank to a network: a [[Vsap2qco|balance]] gives the rate, a proportional loss gives [[gN72WrAO|exponential decay]], several coupled rates give [[u38TIs0J|coupling]] and [[iOGYFvso|feedback]], and a delayed response needs its own vocabulary ([[hSeQakhh|delay and lag]]).
- What must be remembered to continue the evolution is the [[u18hGtFd|sufficient state]]. [[HF547EI2|Markov chains]], state-space control ([[u0TgVFYF|controllability and observability]]) and [[4cU0TSmY|graph diffusion]] all rest on that idea. Near an equilibrium the rule is replaced by its [[BG0z13Wz|linearization]], a [[Gs96QiPq|Lyapunov function]] certifies where imbalance is lost, and [[SQo89ykf|discretization]] separates the model from the algorithm that simulates it.
- The rule itself, how it is written from mechanisms and what it needs to become a concrete trajectory, is the subject of [[AjNT7Eno|differential equations]]: [[0q8Le7Y9|time]] as the parameter of the path, the [[wwPZUijW|initial condition]] that selects one solution, the [[AdHDszdQ|constraints]] a field must keep tangent, and the split between [[VV2OsW44|ODE]] and [[ucNBFjoJ|PDE]]. Whether the field is one global pattern or deforms with position is [[GN4YVrLV|linear field]]; keeping only its slow modes is [[8CbvYvCN|model reduction]].
- Notation used across these notes: \(F\) is the dynamics matrix in \(\dot x=Fx+Bu\), \(M\) nodal storage, \(W\) graph weights, \(D\) degrees, \(L\) the [[4tV2QGXX|Laplacian]], \(P\) a Markov transition matrix and \(\Sigma\) a [[m5zFVv4g|covariance]]. The usual \(\dot x=Ax+Bu\) is equivalent; \(F\) is used so it is never confused with a tank cross-section \(A\).
- Distributions are columns and transition matrices are row-stochastic, so \(p_{k+1}=P^{\mathsf T}p_k\).

## Interactions

- [[rttI47hN|Systems Theory]] : : Systems theory studies wholes and emergence; dynamical systems is the mathematical machinery underneath it, a state, a rate law and what follows from them
- [[38QY7o3A|Control]] : : Control adds a chosen input to a dynamical system; the plant, the controller and the closed loop are three different objects with three different spectra
