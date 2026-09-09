---
slug: feedback-loop
uid: "iOGYFvso"
address: "mathematics//dynamical systems//feedback loop"
name: "feedback loop"
date: "2026-09-06"
aliases: ["feedforward", "saturation"]
---
There is **feedback** when a perturbation can travel through the dependencies and come back to influence the variable it started from. It can be an internal structure of the process or an interconnection designed by a controller.
- Feedback depends on the state and returns to it. The other way a rate can be pushed is an [[Dzjzq527|external forcing]], a term that depends on time or on an input and not on the state; a rumor or an infection add a third shape, the [[B0rLSdHG|interaction term]], which needs two quantities to meet.
- The product of the connection signs characterizes the local loop: positive, **reinforcing**; negative, **compensating**. If sensitivities change sign with the state, this classification can change too.
- The sign does not decide stability. Take

{math}
\dot x_1=-ax_1+k_{12}x_2,\qquad \dot x_2=k_{21}x_1-bx_2,\qquad a,b>0.
{/math}

The trace is \(-(a+b)\) and the determinant \(ab-k_{12}k_{21}\). In this two-state case the origin is asymptotically stable exactly when \(ab>k_{12}k_{21}\). A positive loop can be dominated by the decays. A negative loop is stable in this particular example, but in higher order, with delays or enough phase lag, it can destabilize. **A property of this example is not a universal rule.**
- Feedforward does not wait for the error. In [[5zL83qyU|control]], **feedforward** is an action computed from the reference or a known disturbance; **feedback** uses output or state information. They coexist: a drone can receive a nominal weight compensation and, on top of it, correct its altitude error. In a dependency graph "feedforward" also describes a chain with no return; context says whether topology or controller function is meant.
- Two meanings of saturation. In \(\dot x=rx-\gamma x^2\), with positive parameters and \(x\ge0\), the nonlinear brake compensates growth around a finite level: an **emergent dynamic saturation**, developed in [[gN72WrAO|exponential decay]]. In an actuator,

{math}
u_{\mathrm{real}}=\operatorname{sat}(u_{\mathrm{cmd}};u_{\min},u_{\max}),
{/math}

the output is limited by actuation bounds: a **static saturation nonlinearity**. It needs no state of its own, though it can change the stability of the loop. With integral action the accumulated error keeps growing while the actuator is pinned; that is *windup*.
- The connections themselves are the subject of [[u38TIs0J|coupling]]; the timing of the return is explained in [[hSeQakhh|delay and lag]]. The collective outcome, not the intention of the loop, is what [[l8kVhz53|stability analysis]] studies.

## Interactions

- [[h9K0How0|Cybernetics]] : : Cybernetics names the loop (negative feedback regulates, positive feedback amplifies); the loop sign alone never decides stability, the magnitudes and the phase do
