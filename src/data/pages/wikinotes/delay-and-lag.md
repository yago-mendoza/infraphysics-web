---
slug: delay-and-lag
uid: "hSeQakhh"
address: "mathematics//dynamical systems//delay and lag"
name: "delay and lag"
date: "2026-09-06"
aliases: ["dead time", "convolution memory"]
---
"Responds late" can hide different mechanisms. A **pure delay** reproduces a shifted signal, \(y(t)=u(t-\tau_d)\): a change in the input does not appear in the output before \(\tau_d\).
- In a delay equation,

{math}
\dot x(t)=f\bigl(x(t),x(t-\tau_d),u(t)\bigr),
{/math}

the current value is usually not enough to continue the solution. A **history function** on \([t_0-\tau_d,t_0]\) is needed.
- A lag is not dead time. A **first-order lag** satisfies

{math}
\tau_c\dot a=u-a,\qquad \tau_c>0.
{/math}

\(a\) is a filtered state and \(\tau_c\) a time constant. For a unit step from rest, \(a(t)=1-e^{-t/\tau_c}\): it responds from the start, even if it does not reach the new value immediately. Under a sinusoid of angular frequency \(\omega\), the pure delay has phase \(-\omega\tau_d\) and unit gain; the lag has phase \(-\arctan(\omega\tau_c)\) and gain \(1/\sqrt{1+(\omega\tau_c)^2}\). Different mathematical signatures. A drone motor can show lag, digital latency, or both.
- Convolution and memory. For a linear time-invariant system with no direct feedthrough,

{math}
y(t)=y_{\mathrm{free}}(t)+\int_0^t H(t-\tau)u(\tau)\,d\tau.
{/math}

\(H\) is the **impulse response** or kernel; the integral is the [[A9DuyXJ2|convolution]]. Every past contribution generates a shifted, scaled response. \(H\) need not be positive, dimensionless or a probability.
- An exponential memory admits a scalar [[u18hGtFd|sufficient state]]. Several exponentials may need several states. An ideal pure delay has, in general, no exact finite-dimensional LTI realization; a finite approximation does not remove that difference.
- Reading data. A shift in cross-correlation can suggest a time scale, but can also reflect autocorrelation, mediation or a common input. It does not prove causality. Slow sampling, noise and uninformative experiments can make mechanisms indistinguishable.
- Mediation through intermediate states ([[u38TIs0J|coupling]]) produces intermediate dynamics, not necessarily dead time. Phase lag matters in a [[iOGYFvso|feedback loop]]. Digital latency and hold also belong to [[SQo89ykf|discretization]].

## Interactions

- [[Latency7|Latency]] : : Infrastructure latency is a pure delay in the control sense: nothing arrives before it, whereas a lag responds immediately but slowly
