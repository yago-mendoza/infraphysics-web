---
slug: equilibrium-and-stability
uid: "l8kVhz53"
address: "mathematics//dynamical systems//equilibrium and stability"
name: "equilibrium and stability"
date: "2026-09-06"
aliases: ["attractor", "limit cycle", "chaos"]
---
Where can the system stay, and what happens when it is perturbed there? An **equilibrium** of \(\dot x=f(x)\) satisfies \(f(x^*)=0\): starting exactly there produces a constant trajectory. That says nothing yet about the surroundings. With a constant input \(u^*\) the condition is \(f(x^*,u^*)=0\): a hovering drone needs thrust to cancel its weight, so equilibrium does not mean absence of input.
- Stability answers another question. An equilibrium is **stable in the sense of Lyapunov** if sufficiently close initial conditions stay close. It is **asymptotically stable** if they also converge to it, and **exponentially stable** if the distance is bounded by a decaying exponential. It is **unstable** if arbitrarily small perturbations end up moving away. A **saddle** mixes attracting and repelling directions. "Neutral" is often used for stability without return, but it is better to state the exact property than to read it off a zero eigenvalue.
- Local, regional and global. "Local" restricts initial conditions to a neighborhood; "global" refers to the whole declared domain. For \(\dot x=rx-\gamma x^2\), with \(r,\gamma>0\), the positive equilibrium attracts every \(x(0)>0\) but not \(x(0)=0\), which stays at another equilibrium. In a closed diffusive network ([[4cU0TSmY|diffusion and consensus]]) there is a whole family of constant equilibria: the dynamics removes disagreement but does not return to the same common value after a perturbation that changes the total amount.
- Attractor and periodic regime. An **attractor** is an invariant set that attracts a region of initial conditions, under the adopted definition. It can be an equilibrium or a periodic orbit. A **limit cycle** is an isolated periodic orbit of an autonomous system; not every limit cycle is attracting. A response with \(x(t+T)=x(t)\) forced by a periodic input is neither a fixed equilibrium nor automatically a limit cycle: holding a point and following a trajectory are different control goals ([[5zL83qyU|feedback control]]).
- Chaos is not any instability. **Deterministic chaos** combines nontrivial evolution and sensitivity to initial conditions; in the usual reading, bounded aperiodic trajectories with exponential separation over some interval, plus specific formal conditions. A **Lyapunov exponent** of a trajectory is not an instantaneous eigenvalue of the Jacobian. \(\dot x=x\) is unstable without being chaotic; \(\dot x=-x-x^3\) is nonlinear and convergent. Nonlinearity, instability and chaos are different properties.
- The [[BG0z13Wz|linearization]] supplies local tests; a [[Gs96QiPq|Lyapunov function]] can widen the conclusion; [[SQo89ykf|discretization]] separates the behavior of the model from errors of the algorithm.

## Interactions

- [[gd9F2E5b|Emergence]] : : Attractors are how emergence shows up in a state space: the collective regime is a geometric object no single equation was written to produce
