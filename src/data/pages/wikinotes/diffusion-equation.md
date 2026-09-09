---
slug: diffusion-equation
uid: "lHnt7xrH"
address: "mathematics//differential equations//PDE//diffusion equation"
name: "diffusion equation"
date: "2026-09-07"
aliases: ["heat equation", "spatial diffusion", "Laplacian in diffusion"]
---
How a quantity spreads in space: its time rate at a point is proportional to the **curvature** of its profile there.

{math}
\frac{\partial c}{\partial t}=D\,\frac{\partial^2 c}{\partial x^2}\qquad\text{in one dimension,}\qquad
\frac{\partial c}{\partial t}=D\,\nabla^2 c\qquad\text{in three.}
{/math}

- The second derivative says whether the profile bends upward or downward. Where it bends upward the point sits below the average of its neighbors, and the concentration rises; where it bends downward the point is above its neighbors and it falls. The relation between \(c\) and \(c_{xx}\) is like the one between a velocity vector and its acceleration: the second derivative is how the change of the slope changes at that point.
- In three dimensions a point has neighbors in every direction, and the sum of the three second derivatives is the Laplacian, \(\nabla^2 c=\nabla\cdot\nabla c\): the divergence of the gradient. \(\nabla\), the del operator, is the vector of partial derivatives; applied once it gives the gradient, the direction of fastest increase; the divergence of that gradient measures how much the field at a point differs from its surroundings ([[ko3I0fbY|gradient, divergence and curl]]). \(D\) is the diffusivity, the constant that turns curvature into a rate.
- Diffusion smooths: bumps decay, and the sharper the bump the faster it decays. Written on a grid or a network, the same equation becomes \(\dot c=-Lc\) with the [[4tV2QGXX|graph Laplacian]], whose positive convention \(L=D-W\) carries the opposite sign of \(\nabla^2\); the decay rates of the spatial patterns are its eigenvalues ([[kRgRUf2W|spectral gap]]).
- It is the spatial term of the [[AjNT7Eno|gains-minus-losses]] recipe: add \(D\nabla^2 c\) to an ODE for \(c\) and the model gains space; add a reaction such as an [[B0rLSdHG|interaction term]] and it becomes a reaction-diffusion system.

## Interactions

- [[4tV2QGXX|graph Laplacian]] : : The graph Laplacian is the diffusion equation with space chopped into nodes: the second derivative becomes the weighted difference to the neighbors, the smooth profile becomes a vector, and the sign flips by convention. Diffusion on a network is this equation, not an analogy to it
