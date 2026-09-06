---
uid: "HrEqv7Lc"
address: "ML//agent//harness//equivalence"
name: "Harness Equivalence"
date: "2026-09-03"
---

Two search commands can look identical to a caller while one uses literal matching and another uses embeddings plus reranking. Harness equivalence asks when internal differences stop mattering to the agent behavior we care about.

This is an open working question, not an established equivalence relation for end-to-end agents.

{math}
H_1\approx_{M,\mathcal D,\varepsilon}H_2
{/math}

The statement is incomplete unless it names the model \(M\), task distribution \(\mathcal D\), metric, and tolerated difference \(\varepsilon\). Two harnesses may be equivalent in task success while radically different in latency, token cost, safety, or debuggability.

Equivalence is model-relative. A terse schema that reliably guides one model may confuse another. It is also distribution-relative: search implementations that behave alike on application code may diverge on generated files or multilingual repositories.

The practical lesson is to benchmark the whole agent interface, not infer behavior from implementation diagrams.

## Interactions

- [[HidAb1P9|hidden ABI]] : : Equivalent implementations must preserve the behavioral contract perceived by the model, not only their return type
