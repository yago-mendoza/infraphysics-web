---
slug: linear-field
uid: "GN4YVrLV"
address: "mathematics//dynamical systems//linear field"
name: "linear field"
date: "2026-09-07"
aliases: ["linear vector field", "nonlinear field", "Jacobian as a function"]
---
In a linear system, \(\dot x=Fx\), the whole field is **one global coherent pattern** built by a single matrix: a stretching, a contraction, a rotation, a shear, or a combination of them, applied identically everywhere. Move to a point twice as far from the origin and the arrow there is exactly twice as long in the same direction: \(f(2x)=2f(x)\), \(f(x+y)=f(x)+f(y)\).
- Nonlinearity breaks that proportion. With \(f(x)=x^3\), \(f(2x)=8x^3\), not \(2f(x)\); with \(x^2\) the sign stops flipping with \(x\). The arrow at a proportionally displaced point is no longer proportional, and the field **deforms depending on where you are**. Nothing needs to be cut, cornered or discontinuous: the field can be perfectly smooth. What is lost is a single geometric rule valid everywhere; the effective rule now depends on the region of the state space.
- The [[BG0z13Wz|Jacobian]] makes this exact. In a linear field it is the same matrix \(F\) at every point: constant Jacobian is what "linear transformation" means. In a nonlinear field the Jacobian is a **function of position**, \(J(x)\), and it changes as you move across the state space, not only at equilibria. Computing it at any point recovers the local linear pattern, the stretch-rotate-shear that best matches the field there, which is why linearizing at a point allows the local behavior to be studied with the linear toolkit ([[Xevpd3GQ|modes]]).
- The [[B0rLSdHG|product terms]] of population models are the everyday source of the deformation: doubling both species quadruples the encounter term. An [[l8kVhz53|equilibrium]] is where the field vanishes, and the Jacobian there decides what the local pattern is, but the field keeps its own varying Jacobian everywhere else ([[PeYZGshp|phase portrait]]).

## Interactions

- [[BG0z13Wz|linearization]] : : The linearization note computes the Jacobian at a point; this note is the reason it depends on the point at all. Constant Jacobian and linear field are the same statement; a Jacobian that varies across the space is what nonlinearity looks like once you stop looking at one point
