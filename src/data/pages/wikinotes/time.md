---
slug: time
uid: "0q8Le7Y9"
address: "mathematics//differential equations//time"
name: "time"
date: "2026-09-07"
aliases: ["independent variable", "non-autonomous", "time as a parameter"]
---
In a differential equation, time is normally the **independent variable that parametrizes the trajectory**. The state \(x(t)\) is a point moving through the state space; \(t\) is the clock that says where along the path you are.
- Every trajectory is parametrized by \(t\), in autonomous systems too. The difference is whether \(t\) appears in the rule that generates the field. In an [[z2Ozbisa|autonomous system]], \(\dot x=f(x)\), it does not: the clock tells you where you are, it does not modify the rules of the terrain. In a non-autonomous system it does:

{math}
\dot x=-x+\sin t.
{/math}

Here the law that determines \(\dot x\) changes with time. Same state, different instant, different velocity.
- What that does to the picture. With three state variables the field is a sea of arrows in a three-dimensional space and time is what moves you through it. If the field is non-autonomous, time is effectively a fourth dimension, and the arrows themselves change as it passes ([[PeYZGshp|phase portrait]]).
- Time is not the same kind of dimension as a fourth state variable. If a field on three coordinates is extended with a fourth coordinate, moving along it changes the arrows too, but reversibly: crawl forward and they change one way, crawl back and they change back. Time is not something you move along; it passes, the arrows change with it, and you cannot go back.
- The standard trick to hide the difference: append \(t\) to the state with \(\dot t=1\). The system becomes autonomous in one more dimension, and the non-autonomous example above is an autonomous system in \((x,t)\). This is also why a [[u18hGtFd|sufficient state]] of a non-autonomous system has to include the clock. An [[Dzjzq527|external forcing]] is the usual way \(t\) enters a rule.

## Interactions

- [[u18hGtFd|sufficient state]] : : For an autonomous system the state is sufficient and time is only a parameter along the path; for a non-autonomous one, knowing the state without the clock is not enough to continue, so time has to be carried as part of the state or the memory
