---
slug: balance-equation
uid: "Vsap2qco"
address: "mathematics//dynamical systems//balance equation"
name: "balance equation"
date: "2026-09-06"
aliases: ["derivative and integral", "rate and accumulation"]
---
How much there is, how fast it changes and how much accumulates are three different quantities tied together by a balance.
- A **time derivative** is an instantaneous rate of change. If \(V(t)\) is the water volume in a tank, \(\dot V(t)\) is its rate: volume per time, not accumulated volume and not volume divided by the clock reading.

{math}
\dot V(t)=\lim_{\Delta t\to0}\frac{V(t+\Delta t)-V(t)}{\Delta t}.
{/math}

- The **integral** accumulates rates. Knowing the initial volume and the net flow,

{math}
V(t)=V(t_0)+\int_{t_0}^{t}\dot V(\tau)\,d\tau.
{/math}

\(\tau\) runs over the interior instants of the integral; here it is neither a delay nor a time constant.
- The balance builds the equation. For a tank with no internal generation, \(\dot V=q_{\mathrm{in}}-q_{\mathrm{out}}\) expresses conservation. Closing the model still needs an outflow law, for example \(q_{\mathrm{out}}=kh\) within an approximately linear regime. With \(V=ah\) and constant section \(a\),

{math}
a\dot h=q_{\mathrm{in}}-kh.
{/math}

The section is not a conductance: it converts flow into level velocity. That distinction is the [[f2KRNCOg|nodal capacity]] of a physical network.
- The general recipe behind every such equation: the derivative of a quantity equals what makes it increase minus what makes it decrease, and the mechanisms are added one term at a time, an [[B0rLSdHG|interaction term]], a feedback, an [[Dzjzq527|external forcing]], a spatial diffusion ([[AjNT7Eno|differential equations]]).
- Signs live at different levels. \(h>0\) is a positive level; \(\dot h<0\) says it is falling; \(\ddot h>0\) says its velocity is increasing, perhaps becoming less negative. A positive second derivative does not guarantee the level is already rising. For a position \(q\), \(\dot q\) is velocity, \(\ddot q\) acceleration and \(q^{(3)}\) **jerk**: successive rates with different units. More derivatives does not mean better control.
- An integral relation is not an explicit solution.

{math}
h(t)=h(0)+\int_0^t \frac{q_{\mathrm{in}}(\tau)-kh(\tau)}{a}\,d\tau
{/math}

is the same dynamics written another way, with the unknown function still inside the integral. Writing it this way has not solved it.
- A proportional loss leads to [[gN72WrAO|exponential decay]]. Several coupled rates define a vector field ([[PeYZGshp|phase portrait]]). An algorithm that accumulates rates in finite steps is a numerical scheme ([[SQo89ykf|discretization]]), not a new physical law.
