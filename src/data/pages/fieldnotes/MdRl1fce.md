---
uid: "MdRl1fce"
address: "ML//agent//harness//model-relative interface design"
name: "Model-relative interface design"
date: "2026-09-03"
---

An agent interface is **model-relative** when its usefulness depends on the model and post-training policy consuming it. A schema can be valid for every MCP client while remaining cognitively ergonomic for one model, merely usable for another and actively confusing for a third.

- **Names:** Anthropic found that prefix and suffix namespacing have non-trivial effects that vary by LLM.
- **Formats:** JSON, XML, Markdown and prose can produce different outcomes because models inherit different training distributions and parsing habits.
- **Granularity:** Stronger models may exploit general shell tools; other models benefit from narrower operations that encode more workflow.
- **Budget:** A coarse tool can dominate with five calls remaining while fine-grained tools preserve flexibility under a larger budget.
- **Versioning:** Changing the model can invalidate interface optimizations even when every software type and endpoint remains compatible.
- **Portability:** Syntax portability does not imply cognitive portability. Interoperability claims should include cross-model behavioral evaluations.

The practical consequence is co-adaptation: model and harness should be evaluated as a pair, and old scaffolding should be stress-tested whenever model capability changes.

## Interactions

- [[HidAb1P9|hidden ABI]] : : Behavioral compatibility depends on whether the target model still interprets the interface as intended
- [[HrEqv7Lc|harness equivalence]] : : Two harnesses can be equivalent for one model and observably different for another
