---
slug: autonomous-system
uid: "z2Ozbisa"
address: "mathematics//differential equations//ODE//autonomous system"
name: "autonomous system"
date: "2026-09-07"
aliases: ["time-invariant system", "non-autonomous system", "Lotka-Volterra"]
---
A system is autonomous when the rule that generates the field does not contain time: \(\dot x=f(x)\). The velocity at a state is the same whenever you pass through it.

{math}
\dot r=ar-brf,\qquad \dot f=crf-df.
{/math}

- Rabbits \(r\) and foxes \(f\): rabbits breed on their own and get eaten when they meet foxes; foxes grow by eating and die on their own. Nothing in the rule knows what time it is. The two [[B0rLSdHG|interaction terms]] carry the encounters, and the whole picture is one fixed sea of arrows in the \((r,f)\) plane. That is a three-dimensional autonomous field once you add a third species, and still a fixed field.
- Trajectories are still parametrized by \(t\), in the autonomous case as much as in any other. The difference is only whether \(t\) appears in the rule: the clock tells you where you are along the path, it does not change the rules of the terrain ([[0q8Le7Y9|time]]).
- In a non-autonomous system, \(\dot x=-x+\sin t\) for instance, the sea of arrows itself moves: the same state has a different velocity at a different instant, and the field has effectively one more dimension ([[Dzjzq527|external forcing]]).
- Two consequences of autonomy: trajectories never cross, because a state has one velocity ([[wwPZUijW|initial condition]]), and any non-autonomous system can be made autonomous by adding \(t\) as a state with \(\dot t=1\), at the price of that extra dimension.

## Interactions

- [[HF547EI2|Markov chain]] : : A time-homogeneous Markov chain, one whose transition matrix does not change from step to step, is the discrete probabilistic version of an autonomous system: the rule is fixed and only the state moves. A chain with a time-varying matrix is the non-autonomous case
