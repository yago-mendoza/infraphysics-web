---
uid: "HidAb1P9"
address: "ML//agent//harness//hidden ABI"
name: "Hidden ABI"
date: "2026-09-03"
---

A binary ABI tells compiled components how to exchange arguments and results. An agent has a looser, probabilistic equivalent between the LLM and [[HaRn3sA1|harness]].

This is an editorial analogy, not a claim that agent systems lack prior interface concepts. [[Aci2405X|Agent-Computer Interface]] already names the broader interaction surface. Hidden ABI isolates the behavioral fact that a representation can remain software-compatible while changing how a model selects and interprets actions.

Its effective contract includes tool names, descriptions, schemas, examples, output formatting, truncation, and error semantics. Changing only a description can change which action the model selects even when the implementation remains byte-for-byte identical.

{math}
P(a\mid c,T)
{/math}

Here the available tools \(T\) are not passive documentation. They modify the policy over actions. This makes the interface partly executable: natural language and data structures program behavior without deterministically specifying it.

Traditional compatibility asks whether a call still runs. Agent compatibility must also ask whether the model still understands when to make the call.

- **Action representation:** Names, descriptions and schemas alter tool selection.
- **Observation representation:** Output shape, identifiers and truncation alter the next decision state.
- **Recovery representation:** Errors teach the model which retry or fallback remains available.
- **Adversarial consequence:** [ToolTweak](https://arxiv.org/abs/2510.02554) moved selection from roughly 20% to as high as 81% by manipulating tool names and descriptions.

## Interactions

- [[TlAb1Def|tool interface]] : : The tool schema is the most visible part of the behavioral contract between model and harness
