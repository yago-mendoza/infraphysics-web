---
uid: "Llm7G3nQ"
address: "ML//large language model"
name: "Large Language Model"
date: "2026-09-04"
---

A large language model learns a distribution over token sequences and uses it to predict what should come next. GPT, Claude and Llama are families built around this mechanism, although the products carrying those names usually add retrieval, tools, policy layers and conventional software.

The useful boundary is simple: an LLM generates. It does not automatically remember yesterday, execute the shell or possess an objective that survives between requests. Those properties are assembled around it.

- **Weights** preserve what training changed.
- **Context** supplies what this inference can currently see.
- **Sampling** turns token probabilities into one particular continuation.

Calling the whole product “the model” hides most of the engineering.

## Interactions

- [[WA8fVNaT|agent]] : : An LLM becomes the policy component of an agent only when a runtime gives its outputs persistence, observations and consequences
- [[Rx5QMqad|inference]] : : Inference is the process that turns fixed model weights plus current context into the next token distribution

