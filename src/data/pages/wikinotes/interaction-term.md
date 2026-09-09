---
slug: interaction-term
uid: "B0rLSdHG"
address: "mathematics//differential equations//interaction term"
name: "interaction term"
date: "2026-09-07"
aliases: ["mass action", "product term", "transfer term"]
---
A term in a rate equation that is proportional to the **product** of two quantities, because the thing it describes only happens when the two meet.

{math}
\dot u=-\beta u m,\qquad \dot m=\beta u m-\gamma m.
{/math}

- Read it as a transfer: what leaves \(u\) enters \(m\), but only at the rate at which \(u\) and \(m\) encounter each other, hence the product \(um\). A rumor needs one person who tells it and one who receives it; an infection needs a susceptible and an infected in the same place; a chemical reaction needs both reactants. If either quantity is zero the transfer stops, whatever the other one is.
- The second equation also has a loss, \(-\gamma m\): a decay that depends on \(m\) alone ([[gN72WrAO|exponential decay]]). Transfer and decay are different shapes of term: the transfer conserves \(u+m\), the decay does not.
- The product is what makes the system nonlinear. Doubling both populations quadruples the encounter rate, so the field is not the same pattern everywhere; it deforms with the state ([[GN4YVrLV|linear field]]). The predator and prey model is built from the same term ([[z2Ozbisa|autonomous system]]).
- In the [[AjNT7Eno|gains-minus-losses]] reading, an interaction term is the gain of one equation and the loss of another, which is why it produces a [[AdHDszdQ|constraint]] when nothing else enters or leaves.

## Interactions

- [[u38TIs0J|coupling]] : : Coupling is any dependence of one rate on another variable; the interaction term is the specific multiplicative form where the rate needs both quantities present. A linear coupling k x2 keeps acting when x1 is zero; a product term does not
