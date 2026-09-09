---
slug: lyapunov-function
uid: "Gs96QiPq"
address: "mathematics//dynamical systems//Lyapunov function"
name: "Lyapunov function"
date: "2026-09-06"
aliases: ["dissipation", "passivity"]
---
How to prove that a system loses imbalance without solving every trajectory. A **Lyapunov function** assigns a scalar to the state in order to study stability. It introduces no new force and need not coincide with physical energy.
- For an equilibrium at the origin, a typical candidate satisfies \(\mathcal V(0)=0\) and \(\mathcal V(x)>0\) away from it. Its derivative along the model is

{math}
\dot{\mathcal V}=\nabla\mathcal V^{\mathsf T}f(x).
{/math}

Under the conditions of the corresponding theorem, a non-positive derivative proves stability and a strictly negative one adds convergence. If they only hold in a region, the conclusion only holds there. On an unbounded domain one must also rule out escape and ensure future existence.
- A proof for connected tanks. In a closed passive network ([[f2KRNCOg|nodal capacity]]), \(M\dot h=-Lh\) with \(M\) diagonal positive and \(L\) symmetric positive semidefinite. Let \(h_*\) be the common level compatible with the initial volume and \(e=h-h_*\mathbf1\). Choose \(\mathcal V(e)=\tfrac12e^{\mathsf T}Me\). Then

{math}
\dot{\mathcal V}=e^{\mathsf T}M\dot e=-e^{\mathsf T}Le\le0.
{/math}

If the graph is connected, the derivative vanishes only at constant states, and within the subspace of conserved volume the only constant state with \(\mathbf1^{\mathsf T}Me=0\) is \(e=0\). An invariance argument completes the convergence. This does not prove a return to a level fixed independently of the volume: it proves [[4cU0TSmY|consensus]] toward the level that conservation allows.
- Passivity and dissipation are not the same claim. With an input \(b\), the algebraic identity

{math}
M\dot h=-Lh+b,\qquad \frac{d}{dt}\tfrac12h^{\mathsf T}Mh=-h^{\mathsf T}Lh+h^{\mathsf T}b
{/math}

shows storage, dissipation and supply. This model has a **passivity** relation for the pair \((b,h)\). Reading it as physical energy or power needs the right factors and units; in gravity-driven hydraulics \(\rho g\) can be included.
- Passivity does not always mean absence of oscillation. An ideal oscillator conserves energy and oscillates. The absence of oscillatory modes in this particular network comes from its first-order structure and from \(M^{-1}L\) being similar to a symmetric positive semidefinite matrix.
- The candidate here measures a quadratic imbalance; the general notion of stability it certifies is the one in [[l8kVhz53|equilibrium and stability]].
