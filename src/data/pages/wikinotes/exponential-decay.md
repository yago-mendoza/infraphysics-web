---
slug: exponential-decay
uid: "gN72WrAO"
address: "mathematics//dynamical systems//exponential decay"
name: "exponential decay"
date: "2026-09-06"
aliases: ["time constant"]
---
A proportional loss produces an exponential: when the rate of loss is proportional to what remains,

{math}
\dot x=-\lambda x,\qquad \lambda>0,\qquad x(t)=x(0)e^{-\lambda t}.
{/math}

\(x\) is a level, \(\dot x\) a rate and \(\lambda\) a parameter with units of inverse time. For \(x\ge0\), the more is left, the more is lost per unit time. Over equal intervals the same **proportion** remains; the same amount is not subtracted.
- The general case. Any rate proportional to the quantity itself, \(\dot x=kx\) with \(k\) an arbitrary constant, has the solution

{math}
x(t)=Ce^{kt},\qquad C=x(0),
{/math}

because the derivative of \(Ce^{kt}\) is \(k\) times itself. \(C\) is not part of the equation: it is the [[wwPZUijW|initial condition]], and every \(C\) is a solution of the same equation. The sign of \(k\) decides the shape: negative is decay, positive is growth, zero is a constant. The exponential is the function whose rate is proportional to its value, which is exactly why it appears wherever a proportional law does ([[AjNT7Eno|differential equations]]).
- The time scale. The **time constant** is \(\tau_c=1/\lambda\): after \(\tau_c\), \(e^{-1}\approx0.368\) of the initial value remains. The **half-life** is \(\ln 2/\lambda\). The exponent must be dimensionless.
- In a linear tank \(a\dot h=-kh\) the rate is \(\lambda=k/a\): more conductance empties faster, more capacity empties slower. Not every hydraulic discharge is exponential. An outflow proportional to \(\sqrt h\), as in another orifice model, gives a different law. The mechanism decides the shape.
- With an input, the deviation from equilibrium decays. If \(\dot x=g_0-\lambda x\) with constant \(g_0\),

{math}
x^*=\frac{g_0}{\lambda},\qquad x(t)=x^*+[x(0)-x^*]e^{-\lambda t}.
{/math}

The level can rise while the deviation shrinks, so a decreasing exponential in a formula does not mean the whole output decreases. With a varying input,

{math}
x(t)=x(0)e^{-\lambda t}+\int_0^t e^{-\lambda(t-\tau)}g(\tau)\,d\tau.
{/math}

The kernel says how much of each past contribution remains: this is memory as convolution, see [[hSeQakhh|delay and lag]].
- Decay, self-amplification and saturation. The term \(+rx\) self-amplifies if \(r>0\). Adding a quadratic brake,

{math}
\dot x=rx-\gamma x^2,\qquad r,\gamma>0,\quad x\ge0,
{/math}

the positive equilibrium is \(x^*=r/\gamma\) and it attracts every \(x(0)>0\). It is not a hard ceiling: from above the level falls toward it, from below it rises. The term \(-\gamma x^2\) alone does not create that positive equilibrium: for \(x(0)>0\) it gives \(x(t)=x(0)/(1+\gamma x(0)t)\), a **non-exponential** decay. "Quadratic" and "saturation" are not synonyms; see [[iOGYFvso|feedback loop]].
