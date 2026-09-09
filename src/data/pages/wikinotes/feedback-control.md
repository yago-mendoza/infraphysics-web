---
slug: feedback-control
uid: "5zL83qyU"
address: "control//feedback control"
name: "feedback control"
date: "2026-09-06"
aliases: ["tracking", "state feedback", "observer", "PID"]
---
How to use inputs and measurements to modify an evolution without confusing plant and controller. The **plant** is the process that receives the actuation. The **controller** computes that actuation. The **closed-loop dynamics** belongs to their interconnection.
- For a linear plant \(\dot x=Fx+Bu\), \(y=Cx\), a state feedback \(u=-Kx+Nr\) produces

{math}
\dot x=(F-BK)x+BNr.
{/math}

\(K\) and \(N\) are design choices. The eigenvalues of \(F\) describe the open plant; those of \(F-BK\) the ideal closed loop. They must not be attributed indistinctly to "the system" without naming the configuration.
- Different goals. **Stabilizing** means making a desired equilibrium stable. **Regulating** means holding an output at a constant reference. **Tracking** a varying reference means controlling the error \(e=r-y\), for example so that it tends to zero. Stability does not automatically imply zero steady-state error or a fast transient, and proves nothing about robustness to uncertainty, delays, noise or actuator limits.
- A vertical drone. With \(m\ddot q=T-mg\) and a constant reference, one proposal is

{math}
T=mg-k_p(q-r)-k_d\dot q.
{/math}

\(mg\) nominally cancels the weight; the other terms correct position and velocity. The rule does not become a physical law: it orders an actuation the motor will have to deliver. For a twice-differentiable reference, with known state and an ideal actuator,

{math}
T=m(g+\ddot r)-k_p(q-r)-k_d(\dot q-\dot r)
{/math}

gives an error satisfying \(m\ddot e+k_d\dot e+k_pe=0\), taking \(e=q-r\) here. The error-sign convention is declared before interpreting signs. The full case is [[EsNQLPTq|vertical drone]].
- Observing is not measuring everything. A linear observer can take

{math}
\dot{\hat x}=F\hat x+Bu+L_o(y-C\hat x).
{/math}

The innovation \(y-C\hat x\) corrects the estimate. The observer needs suitable observability or detectability ([[u0TgVFYF|controllability and observability]]); it does not invent missing information.
- A PID adds proportional reaction, integral memory and an action based on the derivative of the error. The controller's memory is part of the total state. Motor lags, saturations and filters also change the loop that has to be analyzed: see [[iOGYFvso|feedback loop]] for the interconnection and [[hSeQakhh|delay and lag]] for the timing limits. A [[Gs96QiPq|Lyapunov function]] can supply guarantees under explicit hypotheses.

## Interactions

- [[38QY7o3A|Control]] : : The Control root describes what feedback buys; this note separates the three objects that have to be named before any eigenvalue is quoted: plant, controller, closed loop
