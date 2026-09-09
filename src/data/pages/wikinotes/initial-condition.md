---
slug: initial-condition
uid: "wwPZUijW"
address: "mathematics//differential equations//initial condition"
name: "initial condition"
date: "2026-09-07"
aliases: ["initial value problem", "family of solutions"]
---
A differential equation does not have one solution. It has a family of them, one for each initial condition. The equation fixes the rule; where you start fixes which member of the family you get.

{math}
\dot x=kx\quad\Longrightarrow\quad x(t)=Ce^{kt},\qquad C=x(0).
{/math}

- Every value of \(C\) is a valid solution of the same equation. Only after fixing \(x(0)\) is the trajectory determined. The same holds for any system: \(\dot x=f(x)\) plus \(x(t_0)=x_0\) is the initial value problem, and the equation without the condition is a statement about all trajectories at once.
- This is exactly what a [[PeYZGshp|phase portrait]] shows. Each trajectory follows a very different path depending on where it begins, and drawing many of them on one picture is the whole point of the portrait: it is the family of solutions made visible.
- Under mild regularity of \(f\) the solution through a given point exists and is unique, which is why two trajectories of an autonomous system never cross: at the crossing they would share a state and have two different futures ([[z2Ozbisa|autonomous system]]).
- Higher order needs more data: a second-order equation needs position and velocity at \(t_0\), one condition per state variable of the equivalent first-order system ([[kbpURjgr|oscillator]]). For a [[ucNBFjoJ|PDE]] the "initial condition" is a whole profile, plus boundary conditions in space.

## Interactions

- [[PeYZGshp|phase portrait]] : : The portrait draws the family of solutions; the initial condition picks one curve out of it. Ask "what does this system do" and the portrait answers; ask "what does it do from here" and you need the initial condition
