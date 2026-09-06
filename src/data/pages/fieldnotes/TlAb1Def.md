---
uid: "TlAb1Def"
address: "ML//agent//harness//tool interface"
name: "Tool Interface"
date: "2026-09-03"
---

When a program calls an [[Ap8rTm3K|API]], its implementation and interface can be inspected separately. Agent tools split even more sharply: the model normally sees only a name, description, input schema, examples, and previous outputs.

The hidden implementation might use `ripgrep`, a vector index, Tree-sitter, or another model. If each returns compatible search results, the LLM may operate through the same abstraction without knowing what changed underneath.

Names and parameter labels therefore create **affordances**. `execute_operation` is technically flexible but behaviorally vague; `search_payment_logs` makes its intended use legible. A capable tool with a bad interface can be functionally absent because the model rarely selects it correctly.

Tools are APIs for software and instructions for a probabilistic policy at the same time.

## Interactions

- [[mydQy6ia|tool use]] : : Capability depends on both what the implementation can do and whether the model recognizes when to invoke it
