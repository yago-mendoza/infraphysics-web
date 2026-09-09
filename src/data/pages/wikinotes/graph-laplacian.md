---
slug: graph-laplacian
uid: "4tV2QGXX"
address: "mathematics//graph theory//graph Laplacian"
name: "graph Laplacian"
date: "2026-09-06"
aliases: ["Laplacian matrix", "Fiedler vector"]
---
How a network of connections turns differences between nodes into a local balance. For an undirected network with non-negative weights,

{math}
L=D-W,\qquad (Lx)_i=\sum_jw_{ij}(x_i-x_j).
{/math}

\(L\) is the **unnormalized Laplacian**. \(x\) assigns a value to each node; \(Lx\) sums the weighted differences of that node with respect to its neighbors. It is not yet a velocity: it becomes one, with the right sign and units, when inserted into a dynamic equation.
- From a pipe to a nodal balance. If a pipe obeys \(q_{ij}=k_{ij}(h_i-h_j)\), the component \((Lh)_i\) is the net outflow from tank \(i\), so \(-Lh\) is the net inflow. If \((Lh)_i=0\) at one node considered alone, water may enter through some pipes and leave through others: **zero net balance does not mean every flow is zero.** For a whole closed, passive, connected network with no sources, \(Lh=0\) does imply equal levels and no flow on every edge. With sources, pumps or imposed boundaries a steady regime with circulation can exist.
- The constant mode and the components. \(L\mathbf1=0\): the constant vector is an eigenvector of eigenvalue zero. If the undirected graph has several connected components, there is one independent constant mode per component; the multiplicity of the zero eigenvalue counts them.
- The quadratic form measures disagreement,

{math}
x^{\mathsf T}Lx=\frac12\sum_{i,j}w_{ij}(x_i-x_j)^2\ge0.
{/math}

The factor \(1/2\) avoids counting each edge twice in the ordered sum; summing once per undirected edge drops it. This identity explains why \(L\) is positive semidefinite and connects **smoothness over the graph** with its [[Ev3kM5nQ|eigenvalues]].
- Why it shares a name with the continuous Laplacian. On a one-dimensional mesh with spacing \(\Delta s\), the interior stencil is

{math}
\frac{(Lx)_i}{\Delta s^2}=\frac{2x_i-x_{i-1}-x_{i+1}}{\Delta s^2}\approx-\frac{\partial^2x}{\partial s^2}.
{/math}

With the positive convention \(L=D-W\), it is **\(-L\)** that matches the usual sign of \(\Delta=\nabla\cdot\nabla\) in the diffusion equation. The name does not erase that sign difference; see [[ko3I0fbY|gradient, divergence and curl]].
- [[f2KRNCOg|nodal capacity]] turns the balance into rates; [[4cU0TSmY|diffusion and consensus]] studies its evolution; the [[5b5LCoKr|normalized Laplacian]] changes the weighting by degree.
