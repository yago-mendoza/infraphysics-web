---
uid: "tG39sLwD"
address: "ML//hallucination"
name: "hallucination"
date: "2026-02-26"
---
- Models generating confident, plausible, but factually wrong content
- Intrinsic: contradicts the source/context. Extrinsic: makes up facts not in any source
- Root causes: training data noise, pattern matching over factual recall, the language modeling objective optimizes plausibility not truth
- Unsolved. Mitigations: [[yK3RLt0K|RAG]] (ground in retrieved docs), citations, confidence calibration — none eliminate it
---
[[yK3RLt0K|RAG]] :: RAG's primary motivation is reducing hallucination — by grounding generation in retrieved documents, the model has facts to cite instead of inventing them
