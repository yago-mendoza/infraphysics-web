---
slug: phase-portrait
uid: "PeYZGshp"
address: "mathematics//dynamical systems//phase portrait"
name: "phase portrait"
date: "2026-09-06"
aliases: ["vector field", "phase space", "flow"]
---
How to look at every possible evolution at once, instead of a single time curve. For an autonomous system \(\dot x=f(x)\), the **vector field** assigns a velocity to every admissible state. A **trajectory** is the solution obtained by choosing an initial condition. The **phase portrait** draws the geometry of many trajectories, equilibria and directions of evolution. Three different objects: a rule over the domain, one concrete path, and a picture of the set of paths.
- The axes are states, not parameters. For an oscillator

{math}
\dot q=v,\qquad m\dot v=-kq-cv,
{/math}

the phase plane has coordinates \((q,v)\): a point specifies the present position and velocity. \(m\), \(k\) and \(c\) select the field but are not the axes of that portrait. Drawing the behavior for several values of \(k\) and \(c\) is a study in **parameter space**, not the same phase plane. Changing state and changing system are different moves.
- Instantaneous velocity and accumulated evolution. The field \(f(x)\) gives the velocity now. The **flow** \(\Phi_t(x_0)\) gives where the initial condition \(x_0\) ends up after a time \(t\):

{math}
\Phi_t(x_0)=x(t;x_0).
{/math}

Here "flow" is an evolution map; it does not necessarily mean a flow of water. The operation is integrating the dynamics, see [[Vsap2qco|balance equation]].
- Crossings and projections. In an autonomous system with uniqueness, two solutions cannot reach the same state and have different futures, so orbits do not cross transversally. Projections of a higher-dimensional system can cross: they may differ in a state that is not drawn. With a varying input or explicit time dependence the same \(x\) can have different velocities at different instants, and a family of curves on the plane no longer defines a single autonomous field on it.
- Names, since three things get called "the field". The space whose axes are the state variables is the **state space** (or phase space). The rule that puts an arrow at every point of it is the **vector field**. The drawing of trajectories on it is the phase portrait. The arrows are the dotted variables, \(\dot x\); the axes are the plain ones, \(x\). For a second-order system the axes are position and velocity and the arrows carry velocity and acceleration ([[kbpURjgr|oscillator]]).
- Dimensions. Three state variables give a three-dimensional sea of arrows, and [[0q8Le7Y9|time]] is what moves you through it; every trajectory is parametrized by it, whether or not \(t\) appears in the rule ([[z2Ozbisa|autonomous system]]). If the rule is non-autonomous the arrows themselves change as time passes, which is a fourth dimension of a peculiar kind: a fourth state variable also changes the arrows as you move along it, but you can move back and they change back, whereas time only passes. Each trajectory in the portrait is one [[wwPZUijW|initial condition]]; the portrait is the whole family of solutions at once.
- [[l8kVhz53|Equilibria and attractors]] are the geometric objects to look for in the portrait; the [[BG0z13Wz|linearization]] approximates the field near a point. Local properties of the field such as [[ko3I0fbY|divergence]] do not replace the analysis of trajectories.
