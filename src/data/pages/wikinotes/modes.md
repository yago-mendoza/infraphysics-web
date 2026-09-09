---
slug: modes
uid: "Xevpd3GQ"
address: "mathematics//dynamical systems//modes"
name: "modes"
date: "2026-09-06"
aliases: ["eigenvector", "modal decomposition"]
---
Which patterns does a matrix preserve, and what does the factor it applies to them mean? A nonzero **eigenvector** \(v\) of a matrix \(T\) satisfies \(Tv=\lambda v\): the transformation keeps the direction of that pattern and rescales it by the [[Ev3kM5nQ|eigenvalue]] \(\lambda\). The meaning of the scale depends on what \(T\) represents.
- Same equation, different questions.
  - \(F\) in \(\dot x=Fx\): the eigenvector is a dynamic pattern of the state; the eigenvalue a time rate in \(e^{\lambda t}\).
  - \(L\) in \(\dot x=-Lx\): a pattern of disagreement over a network; a decay rate in \(e^{-\lambda t}\) when \(L\) has units of rate.
  - \(P\) in a [[HF547EI2|Markov chain]]: a mode of the transition operator; a per-step factor \(\mu\), where side and convention matter.
  - \(\Sigma\) of data ([[m5zFVv4g|covariance matrix]]): a direction in variable space; the projected variance for a unit eigenvector.
  Eigenvectors are not always equilibria, nor always vibrations. A covariance does not by itself govern the time evolution of a system.
- Why a mode evolves without changing shape. If \(Fv=\lambda v\) and \(x(0)=cv\), then \(x(t)=ce^{\lambda t}v\): every component keeps its proportion within the pattern and only the amplitude changes. With enough independent eigenvectors any state decomposes as

{math}
x(0)=\sum_i c_i v_i,\qquad x(t)=\sum_i c_i e^{\lambda_i t}v_i.
{/math}

With an orthonormal basis, \(c_i=v_i^{\mathsf T}x(0)\). In a general basis the inverse of the eigenvector matrix is used, not simply its transpose.
- Important limits. Real symmetric matrices admit an orthonormal basis of real eigenvectors. A non-symmetric matrix can have complex eigenvalues, non-orthogonal eigenvectors or fail to be diagonalizable, without necessarily showing all those problems. In a Jordan block factors like \(te^{\lambda t}\) appear. Non-normal matrices can amplify transiently even when every eigenvalue has negative real part: the spectrum describes the asymptotics, not the whole transient. A complex pair \(\alpha\pm i\omega\) of a real matrix is a modal plane with growth or decay and rotation; the real pattern is rebuilt from the conjugate pair.
- Network example. For a chain of three tanks, \((1,1,1)^{\mathsf T}\) is the constant mode; \((1,0,-1)^{\mathsf T}\) and \((1,-2,1)^{\mathsf T}\) describe different disagreements. Under diffusion their amplitudes vanish at different speeds ([[eZ9MJEbt|three-tank network]]).
- The [[BG0z13Wz|Jacobian]] provides the matrix whose modes are read here; the [[gN72WrAO|scalar decay]] is the one-mode case.

## Interactions

- [[Ev3kM5nQ|eigenvalue]] : : The eigenvalue note treats the scalar; here the question is what the scale means, a rate, a per-step factor or a variance, depending on which matrix owns it
- [[Sp5mK8cJ|saddle point]] : : A saddle in a loss landscape and a saddle equilibrium in a phase portrait are the same eigen-structure read on different objects: mixed-sign curvature versus mixed-sign rates
