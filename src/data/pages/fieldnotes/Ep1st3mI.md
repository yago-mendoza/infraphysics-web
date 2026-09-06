---
uid: "Ep1st3mI"
address: "ML//agent//harness//epistemic interface"
name: "Epistemic Interface"
date: "2026-09-03"
---

A programmer sees a repository through an editor, terminal, search results, and test output (not by loading every physical bit into consciousness). An agent is even more constrained: its tools define the observations from which its world is constructed.

{math}
o_t=O_H(s_t)
{/math}

The environment state \(s_t\) may contain files, processes, Git history, and network services. The harness observation function \(O_H\) turns some of that state into serialized context \(o_t\). Existing data is not known data.

Read, search, and inspect tools behave like sensors. Write, delete, deploy, and send tools behave like actuators. Tests do both: they alter computational state and return evidence.

This is why tools are epistemic interfaces, not merely capabilities. They determine what distinctions the model can perceive before it acts.

The phrase is a lens over the observation side of an Agent-Computer Interface, not a claim to a new interface category. Its value is the question it foregrounds: what can this representation let the agent know, and what distinctions has the harness erased before inference begins?

## Interactions

- [[4vDsUzfM|policy]] : : The model selects actions from partial observations rather than from direct access to environment state
