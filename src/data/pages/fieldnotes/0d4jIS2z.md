---
uid: "0d4jIS2z"
address: "ML//code generation//AlphaCode"
name: "AlphaCode"
date: "2026-03-03"
---
- DeepMind's [[LV1qRnuc|code-generation]] system for competitive programming. AlphaCode (2022) reached roughly the median competitor on Codeforces; AlphaCode 2 later improved the pipeline with stronger models and search.
- Core technique: generate massive candidate pool (millions), then filter and cluster: brute force + selection.
- AlphaCodeium (open): flow engineering, iterative test generation, execution, and refinement around a base model.
- The lesson: inference-time compute is architectural. Generating, executing, filtering, and selecting candidates can improve a fixed model without changing its weights.

[[d6uchFbH|benchmark]] : : Competitive programming measures synthesis under explicit specifications and executable tests
