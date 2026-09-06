---
uid: "WA8fVNaT"
address: "ML//agent"
name: "Agent"
date: "2024-03-15"
---
An AI agent repeatedly chooses actions from observations in pursuit of a task. In an LLM agent, the model proposes the next response or [[mydQy6ia|tool]] call and an [[HaRn3sA1|agent harness]] executes the surrounding loop.

- Tools expand the available action and observation spaces beyond text generation.
- Planning may be explicit, implicit in repeated inference, encoded in a workflow, or distributed between model and harness.
- State does not live automatically inside the model. Conversation history, files, memory, and environment state persist only because software stores and presents them again.

The useful shift is from “model as oracle” to “model as policy component.” Agency belongs to the assembled system, not to one completion.

## Interactions

- [[ActP3rcp|active perception]] : : Agents can spend actions to acquire the evidence needed to choose later actions
- [[AgSys4mK|agentic system]] : : The complete system supplies the memory, permissions and environment that make the agent's trajectory possible
- [[Aut0n0my|agent autonomy]] : : Autonomy measures how far that trajectory can continue before human authorization is required
