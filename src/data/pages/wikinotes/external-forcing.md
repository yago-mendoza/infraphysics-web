---
slug: external-forcing
uid: "Dzjzq527"
address: "mathematics//differential equations//external forcing"
name: "external forcing"
date: "2026-09-07"
aliases: ["forcing term", "driven system", "input"]
---
A term in a rate equation that depends on time, or on an input chosen from outside, but not on the state: the world pushing on the system on a schedule of its own.

{math}
\dot x=f(x)+g(t).
{/math}

- Examples: a seasonal temperature acting on a tank, a pump that switches on at fixed hours, the \(\sin t\) in \(\dot x=-x+\sin t\). The forcing makes the system non-autonomous, since the rule now contains \(t\) explicitly ([[0q8Le7Y9|time]], [[z2Ozbisa|autonomous system]]).
- Forcing versus feedback. A [[iOGYFvso|feedback]] term depends on the state and returns to it; a forcing term does not care what the state is. A linear system's response to a forcing is a convolution with its impulse response, the memory kernel of [[hSeQakhh|delay and lag]]: each push leaves a decaying trace.
- The same term is called an input when it is chosen rather than suffered. In control, a feedforward action is an external forcing designed to cancel a known disturbance before feedback has to react ([[5zL83qyU|feedback control]]). A periodic forcing can also produce a periodic response that is neither an equilibrium nor a limit cycle ([[l8kVhz53|equilibrium and stability]]).

## Interactions

- [[5zL83qyU|feedback control]] : : To the mathematician a forcing is whatever enters the equation from outside; to the control engineer that same term is the input, and the whole discipline is about choosing it as a function of the state, which turns a forcing back into feedback
