---
slug: discretization
uid: "SQo89ykf"
address: "mathematics//dynamical systems//discretization"
name: "discretization"
date: "2026-09-06"
aliases: ["numerical stability", "Euler method", "discrete time"]
---
A continuous rate is not the same as an update by steps. In continuous time \(\dot x=Fx\) specifies a **rate**; in discrete time \(x_{k+1}=Tx_k\) specifies the **next state**. The matrices play different roles and normally carry different units:

{math}
x(t)=e^{Ft}x(0),\qquad x_k=T^k x_0.
{/math}

The matrix exponential is \(e^{Ft}=I+Ft+(Ft)^2/2!+\cdots\); it is not the exponential applied entry by entry.
- Which eigenvalues dominate. In continuous time each mode carries \(e^{\lambda_i t}\), so the **real part** of \(\lambda_i\) matters. In discrete time it carries \(\mu_i^k\), so the **modulus** of \(\mu_i\) matters. Linear asymptotic stability needs \(\operatorname{Re}\lambda_i<0\) or \(|\mu_i|<1\) respectively. On the boundary the Jordan structure matters, and a mode not excited by the initial condition may not show up in a given response. "The largest eigenvalue dominates" has to specify order, excitation and which output is observed.
- Exact sampling and Euler's approximation. For a linear autonomous system sampled every \(\Delta t\), \(T=e^{F\Delta t}\) reproduces the states exactly at those instants. Euler uses \(T_E=I+\Delta t F\). For \(\dot x=-\lambda x\), \(\lambda>0\), Euler gives \(x_{k+1}=(1-\lambda\Delta t)x_k\): the simulation decays only if \(0<\lambda\Delta t<2\), and between 1 and 2 it alternates sign although the continuous solution does not. To also keep non-negativity from \(x_0\ge0\), the condition \(0\le\lambda\Delta t\le1\) is necessary and sufficient here.
- Discretized diffusion. For a symmetric [[4tV2QGXX|Laplacian]], Euler on \(\dot x=-Lx\) contracts every disagreement mode if

{math}
0<\Delta t<\frac{2}{\lambda_{\max}(L)}.
{/math}

For \(I-\Delta t L\) to also be a non-negative averaging matrix, \(\Delta t\le1/d_{\max}\) is required, assuming weights with units of rate. Stability, non-negativity and accuracy are three different checks.
- A [[HF547EI2|Markov transition matrix]] can define a discrete process on its own; it does not have to come from discretizing a differential equation. And \(P=D^{-1}W\) is not, in general, the exact sample \(e^{-L\Delta t}\) of the unnormalized diffusion.
- Modal powers and exponentials come from [[Xevpd3GQ|modes]]; effects between samples belong to [[hSeQakhh|delay and lag]]; the stability studied in [[l8kVhz53|equilibrium and stability]] is the system's, not the algorithm's.

## Interactions

- [[Gd5tR8wP|Gradient Descent]] : : Gradient descent is Euler applied to gradient flow: the learning rate is the step size, and the same bound that keeps Euler from oscillating is what caps the learning rate
