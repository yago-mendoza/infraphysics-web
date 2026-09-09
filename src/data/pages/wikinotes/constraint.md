---
slug: constraint
uid: "AdHDszdQ"
address: "mathematics//differential equations//constraint"
name: "constraint"
date: "2026-09-07"
aliases: ["invariant", "conservation constraint", "algebraic constraint"]
---
An equality the variables of a differential equation must satisfy at all times. It either comes out of the equations themselves or is a physical condition the model must respect; it cannot be bolted onto an ODE arbitrarily and expected to hold.

{bkqt/keyconcept|The epidemic constraint}
In an SIR model the population is fixed, so susceptible plus infected plus recovered equals N. People move between the three groups (well to sick, sick to recovered, recovered to sick again) but the total never changes: R = N minus S minus I.
{/bkqt}

- Three variables tied by one equality restrict the three-dimensional state space to a plane; with non-negativity of each group it is a triangle in the positive octant. Every constraint typically removes one dimension from what the number of variables suggests: three variables, one constraint, a two-dimensional state.
- Tangency is the test. If \(g(x)=0\) is to hold along every trajectory, its time derivative must vanish, so the velocity has to be **tangent to the constraint surface**: \(\nabla g(x)\cdot f(x)=0\) wherever \(g(x)=0\). In SIR, \(\dot S+\dot I+\dot R=0\) because every term that leaves one equation enters another; the constraint is an invariant of the field.
- Two legitimate origins. Either the constraint is an invariant of the field, as above, or it is a physical condition imposed on the model, such as conservation of mass or volume ([[4cU0TSmY|the conserved total of a closed network]]), non-negativity of a concentration, or a rigid link between coordinates. In the second case the equations have to be written so that the field is tangent to it; if they are not, the constraint is violated the moment the system moves and the model is inconsistent.
- Consequences: a constraint lets you eliminate a variable (write \(R=N-S-I\) and integrate two equations instead of three), it shrinks the space a [[PeYZGshp|phase portrait]] has to show, and in a numerical scheme it drifts unless the integrator preserves it ([[SQo89ykf|discretization]]).

## Interactions

- [[Gs96QiPq|Lyapunov function]] : : A constraint is a quantity the field keeps exactly constant; a Lyapunov function is one it never increases. Same tangency calculation, an equality for the first and an inequality for the second
