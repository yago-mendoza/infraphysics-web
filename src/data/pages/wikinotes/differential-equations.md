---
slug: differential-equations
uid: "AjNT7Eno"
address: "mathematics//differential equations"
name: "differential equations"
date: "2026-09-07"
aliases: ["ODE and PDE", "rate equations"]
---
An equation whose unknown is a function and whose statement is about its rate of change. The modeling idea behind almost all of them fits in one line: the derivative of a quantity with respect to time equals **what makes it increase minus what makes it decrease**.

{bkqt/keyconcept|Building a rate equation}
Start with d(quantity)/dt = gains minus losses.
Then add the mechanisms one term at a time: an [[B0rLSdHG|interaction term]] when two things must meet for something to happen, [[iOGYFvso|feedback]] when the quantity acts on its own rate, an [[Dzjzq527|external forcing]] when the world pushes on a schedule of its own, [[lHnt7xrH|spatial diffusion]] when neighbors in space exchange the quantity.
{/bkqt}

- Two families by the number of independent variables. An [[VV2OsW44|ordinary differential equation]] has one, almost always [[0q8Le7Y9|time]], and its unknowns are functions of that one variable. A [[ucNBFjoJ|partial differential equation]] has several, typically space and time, and its unknown is a field.
- What every one of them needs before it says anything concrete: an [[wwPZUijW|initial condition]], because the equation alone has a whole family of solutions, and, when the model has one, a [[AdHDszdQ|constraint]] the solutions must respect.
- The equation is the rule; what the rule produces over time (trajectories, equilibria, modes, stability) is the subject of [[kkZ5fiaf|dynamical systems]]. The simplest complete example, a proportional rate, is [[gN72WrAO|exponential decay]]; the simplest second-order one is the [[kbpURjgr|oscillator]].

## Interactions

- [[kkZ5fiaf|dynamical systems]] : : The differential equation is the local rule, written term by term from mechanisms; the dynamical system is everything that rule implies once you let it run. One is about writing the model, the other about reading its consequences
