---
uid: "CBYUhW1g"
address: "ML//RAG//HyDE"
name: "HyDE"
date: "2026-02-26"
---
- Hypothetical Document Embeddings: instead of embedding the raw query, ask the LLM to generate a hypothetical answer, then embed that
- The generated document is probably wrong, but its [[haA3MDhG|embedding]] is closer in vector space to the real answer than the query alone
- Improves recall especially for short or vague queries — the LLM "expands" the query into the document's semantic neighborhood
- Simple technique, big impact. No training — works with any embedding model and any LLM
