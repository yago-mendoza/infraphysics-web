---
uid: "ObsD3s1g"
address: "ML//agent//harness//observation design"
name: "Observation design"
date: "2026-09-03"
---

**Observation design** is the deliberate construction of the representation an agent receives from external state. The environment may contain files, processes, logs and network services; the model sees only the output of a harness-defined mapping.

{math}
o_t=O_H(s_t)
{/math}

- **Selection:** Which files, matches, records or events are included at all.
- **Resolution:** A whole file, a 100-line window, one symbol, an aggregate or a summary.
- **Encoding:** Semantic names versus opaque IDs, ordering, JSON versus prose, and whether relationships are made explicit.
- **Failure semantics:** Empty output, truncation and errors must distinguish successful silence from missing evidence or failed execution.
- **Trust:** Provenance and prompt-injection screening matter because observations become instructions-shaped tokens inside the same context as legitimate evidence.
- **Memory hook:** The model does not receive the repository. It receives an argument about the repository assembled by software.

Observation design is not about minimizing output unconditionally. It is about preserving the distinctions needed for the next decision while respecting token, latency and security budgets.

## Interactions

- [[Ep1st3mI|epistemic interface]] : : Observation design is the concrete engineering work behind the epistemic-interface lens
- [[Vo1nf0rm|value of information]] : : An observation is useful to the extent that its representation improves a downstream decision for its cost
