---
slug: oscillator
uid: "kbpURjgr"
address: "mathematics//differential equations//ODE//oscillator"
name: "oscillator"
date: "2026-09-07"
aliases: ["harmonic oscillator", "second-order equation", "order reduction"]
---
The typical second-order equation, and why it lives in a two-dimensional state space anyway.

{math}
\dot r=Aj,\qquad \dot j=-Br\quad\Longrightarrow\quad \ddot r+ABr=0.
{/math}

- Differentiate the first equation and substitute the second and the pair of first-order equations becomes one second-order equation. Read backwards, that is how a second-order equation is always turned into a first-order system: name the velocity as a state.
- An acceleration is involved, but the acceleration is a function of the position, so it is not a new dimension. The state is \((r,j)\), the plane is two-dimensional, and the trajectories are closed curves around the origin turning at angular frequency \(\sqrt{AB}\). Drawn in one quadrant, an arrow at \((r,j)\) points with components \((Aj,-Br)\): the arrows are the dotted variables, the axes are the plain ones ([[PeYZGshp|phase portrait]]).
- The same equation with damping, \(\ddot r+c\dot r+ABr=0\), spirals inward instead of circling; in the language of [[Xevpd3GQ|modes]] the undamped case has a purely imaginary pair of eigenvalues and the damped one a pair with negative real part.
- Two initial data are needed, \(r(0)\) and \(j(0)\), one per state ([[wwPZUijW|initial condition]]); the energy-like quantity \(Br^2+Aj^2\) is conserved by the undamped field, a [[AdHDszdQ|constraint]] that appears from the equations rather than being imposed.

## Interactions

- [[Xevpd3GQ|modes]] : : The modes note reads an oscillation as a complex eigenvalue pair; this note is the same object seen as two first-order equations feeding each other, which is what makes it obvious why acceleration adds no dimension
