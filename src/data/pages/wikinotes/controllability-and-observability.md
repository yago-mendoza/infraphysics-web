---
slug: controllability-and-observability
uid: "u0TgVFYF"
address: "control//controllability and observability"
name: "controllability and observability"
date: "2026-09-06"
aliases: ["minimal realization", "stabilizability", "detectability"]
---
Which modes can our inputs act on, which can our sensors reveal, and which can a minimal model represent? These properties belong to the system **with its chosen inputs and outputs**, not to an isolated dynamics matrix nor to a variable because of its name.
- For \(\dot x=Fx+Bu\), \(y=Cx+Hu\), **controllability** asks whether the inputs can transfer the state between arbitrary states in finite time, inside the ideal linear model. **Observability** asks whether the history of outputs, together with known inputs, distinguishes the initial state.
- The two rank matrices,

{math}
\mathcal C=[B\;FB\;\cdots\;F^{n-1}B],\qquad
\mathcal O=\begin{bmatrix}C\\CF\\\vdots\\CF^{n-1}\end{bmatrix}.
{/math}

The LTI system of dimension \(n\) is completely controllable if \(\operatorname{rank}\mathcal C=n\) and observable if \(\operatorname{rank}\mathcal O=n\). \(F^kB\) describes how actuation propagates through the dynamics; \(CF^k\) how internal combinations leave a trace on the output. Neither matrix is an extra force or sensor.
- A hidden mode. Let \(\dot x_1=-x_1\), \(\dot x_2=-x_2\) and \(y=x_1+x_2\). Two initial states with equal sum produce the same output forever: the difference \(x_1-x_2\) is unobservable from that sensor. If instead the decay rates are different and known, the time evolution of the sum can separate its components. Observing a state does not require measuring it directly.
- Sufficient and minimal are different questions. A [[u18hGtFd|sufficient state]] lets the dynamics continue. A **minimal LTI realization** has the smallest dimension for a given input-output map, usually understood with zero initial state, and it is minimal exactly when controllable and observable. Removing an uncontrollable mode can keep the transfer function and still lose the output due to a nonzero initial condition in that mode. That is why a physical variable cannot be discarded just because no input acts on it: it depends on which behavior must be preserved.
- Weaker conditions. **Stabilizability** requires the uncontrollable modes to be asymptotically stable; **detectability** requires the same of the unobservable ones. In continuous time "stable" here means strictly negative real part; in discrete time, modulus strictly below one (see [[SQo89ykf|discretization]]). Full rank does not guarantee an easy implementation: weakly actuated or nearly indistinguishable modes can demand a lot of energy or amplify noise.
- These properties are what [[5zL83qyU|feedback control]] uses to design actuations and observers. Reducing a model by statistical variance ([[Vp8NyXtD|projection]]) does not automatically preserve them.

## Interactions

- [[JdSKWaAz|Ashby's Law]] : : Ashby asks whether the regulator has enough variety; controllability asks the dual question about the plant: whether the inputs can even reach the modes that need regulating
