---
slug: coupling
uid: "u38TIs0J"
address: "mathematics//dynamical systems//coupling"
name: "coupling"
date: "2026-09-06"
aliases: ["mediated influence"]
---
Two variables are **coupled** when the dynamics of at least one depends on the other. In \(\dot x_i=f_i(x,u,t)\) the first-order instantaneous sensitivity is

{math}
J_{ij}(x)=\frac{\partial f_i}{\partial x_j}.
{/math}

If it is positive, a small increase of \(x_j\) raises \(\dot x_i\) with everything else fixed; if negative, it lowers it. That alone does not fix the final sign of \(\dot x_i\): the other terms may dominate.
- Direct does not mean causally proven. In \(\dot x_1=-a x_1-kx_2+u\) with \(k>0\), \(x_2\) exerts **direct cross inhibition**. The equation postulates that dependence; it does not prove a real causal mechanism exists. Observed [[G8apPDCM|correlation]] and modeled coupling are not the same thing either.
- A **zero of the Jacobian at a point** is not always structural absence. If \(f_1=x_2^2\), then \(\partial f_1/\partial x_2=0\) at \(x_2=0\) although the dependence exists. The zero removes the first-order sensitivity there, not every possible effect.
- An effect can be indirect. With

{math}
\dot x_2=ax_1-bx_2,\qquad \dot x_3=cx_2-dx_3,
{/math}

\(x_1\) does not appear in the equation of \(x_3\) but can affect it through \(x_2\). Perturb only \(x_1\) by a small \(\varepsilon\): at first \(\dot x_2\) changes, and for small times \(s>0\) an approximate contribution \(\delta x_3(s)\approx ac\varepsilon s^2/2\) appears. The propagation is gradual, **with no mandatory dead time**. "First one variable changes" does not require the next ones to stay exactly still for a finite interval; see [[hSeQakhh|delay and lag]].
- Reciprocity and loops. Coupling is **unilateral** if only one direction is present and **reciprocal** if both are. Two reciprocal inhibitions form a loop of positive sign, since the product of two negatives is positive. Its consequences depend on magnitudes and on the rest of the dynamics: that is the subject of [[iOGYFvso|feedback loop]].
- Physical example. In a drone, torque changes angular velocity, angular velocity changes tilt, and tilt changes horizontal acceleration. The effect is mediated by several states; it is not an independent horizontal force.
