---
slug: linearization
uid: "BG0z13Wz"
address: "mathematics//dynamical systems//linearization"
name: "linearization"
date: "2026-09-06"
aliases: ["Jacobian", "linearity"]
---
How to replace a nonlinear dynamics locally by a matrix without confusing the two. A linear map respects **superposition**: transforming a linear combination equals combining the transformations. \(f(x)=Fx\) is linear; \(Fx+b\) is affine if \(b\ne0\). A curved trajectory can belong to a linear system: "linear" does not mean "straight in time".
- The **Jacobian** collects sensitivities,

{math}
J_{ij}(x)=\frac{\partial f_i}{\partial x_j}.
{/math}

Diagonal entries are first-order self-effects; the others are [[u38TIs0J|couplings]]. The units of \(J_{ij}\) are \([x_i]/([x_j][t])\), not necessarily the same across entries when the states have different units.
- Linearizing around an equilibrium. If \(f(x^*,u^*)=0\), define \(\delta x=x-x^*\) and \(\delta u=u-u^*\). First order gives

{math}
\delta\dot x\approx F\delta x+B\delta u,\qquad
F=\left.\frac{\partial f}{\partial x}\right|_*,\quad
B=\left.\frac{\partial f}{\partial u}\right|_*.
{/math}

If the point is not an equilibrium, \(f(x^*,u^*)\) appears as well. Around a nominal trajectory that satisfies the model, its evolution is subtracted and the matrices can depend on time. The matrix adds no forces: it reorganizes the sensitivity of the mechanisms already modeled.
- What eigenvalues allow you to conclude. For an equilibrium and a sufficiently regular field, if every eigenvalue of \(F\) has negative real part there is local asymptotic stability; if one has positive real part, instability. With no positive real parts but some zero real parts the test can be inconclusive: \(\dot x=-x^3\) and \(\dot x=x^3\) both have a zero Jacobian at the origin, one attracts and the other repels. The discarded term decides. See [[l8kVhz53|equilibrium and stability]].
- From component to collective pattern. The Jacobian shows how each rate changes when each state changes. Its [[Xevpd3GQ|modes]] show which combinations evolve together. Two readings of the same approximation.
- The Jacobian is a function, not a number to compute once. In a linear field it is the same matrix everywhere, which is what makes the field one global pattern; in a nonlinear field it changes with the position, and it can be taken at any point, not only at equilibria. Linearizing at a point recovers the local linear pattern and lets the linear toolkit be applied there ([[GN4YVrLV|linear field]]).
- In a drone, \(\sin\theta\approx\theta\) near level flight. That approximation can fail at large tilt or under saturation. A local result does not become global by writing the matrix precisely.

## Interactions

- [[Hs6mT4nQ|Hessian]] : : The Hessian linearizes a scalar landscape (curvature of a loss); the Jacobian linearizes a vector field (sensitivity of rates). Same idea, different object
