---
slug: gradient-divergence-and-curl
uid: "ko3I0fbY"
address: "mathematics//vector calculus//gradient, divergence and curl"
name: "gradient, divergence and curl"
date: "2026-09-06"
aliases: ["nabla", "del operator", "continuous Laplacian"]
---
Which local properties of a field the different uses of nabla describe. \(\nabla\) is a **differential operator**, not the name of a single operation; in Cartesian coordinates its components are spatial partial derivatives.
- The **gradient** of a scalar field \(T\) is \(\nabla T\): the direction of fastest increase in the chosen Euclidean geometry. If \(T\) is temperature, it has units of temperature per length. The **divergence** of a vector field \(v\) is a scalar, \(\nabla\cdot v=\sum_i\partial v_i/\partial x_i\). The **curl** in three dimensions is the vector \(\nabla\times v\): it measures oriented local circulation. Different objects that share an initial symbol.
- Divergence: net expansion, not attraction in every direction. If \(v\) is a fluid velocity, \(\nabla\cdot v\) is the local expansion or contraction of material volume. In incompressible flow \(\nabla\cdot v=0\): the fluid can move, deform and rotate without changing that volume. Positive divergence does not necessarily mean mass creation. Without sources, continuity is

{math}
\frac{\partial\rho}{\partial t}+\nabla\cdot(\rho v)=0,
{/math}

and expansion can come with a drop in density. The interpretation depends on whether the field is a velocity, a mass flux or something else. In a dynamical system \(\dot x=f(x)\), \(\nabla\cdot f=\operatorname{tr}J\). The example \(f(x,y)=(x,-2y)\) has divergence \(-1\) but the origin is a saddle: it contracts area while expanding in one direction. Stability is not deduced from the trace alone ([[l8kVhz53|equilibrium and stability]]).
- Curl: declare the orientation. In the \(xy\) plane,

{math}
(\nabla\times v)_z=\frac{\partial v_y}{\partial x}-\frac{\partial v_x}{\partial y}.
{/math}

With right-handed Cartesian axes, \(x\) to the right and \(y\) up, a positive sign is **counterclockwise** circulation seen from \(+z\), as in the OpenStax reference below. The field \(v=(-y,x)\) has curl \(2\); \(v=(y,0)\) has curl \(-1\) although its vectors are parallel. The curl of a phase portrait must not be read automatically as physical rotation: its coordinates may be position and velocity, with different units ([[PeYZGshp|phase portrait]]).
- Continuous Laplacian and network. \(\Delta T=\nabla\cdot\nabla T\). With diffusive flux \(j=-k\nabla T\) and constant \(k\), a local balance produces a term proportional to \(\Delta T\): that is the [[lHnt7xrH|diffusion equation]]. Discretizing space yields the [[4tV2QGXX|graph Laplacian]], with the sign convention explained there.
- The Jacobian of [[BG0z13Wz|linearization]] gathers all the sensitivities of a field; the [[Gs96QiPq|Lyapunov function]] uses a gradient to compute change along a trajectory.
- Orientation reference: [OpenStax, Calculus Volume 3, section 6.5, Divergence and Curl](https://openstax.org/books/calculus-volume-3/pages/6-5-divergence-and-curl)
