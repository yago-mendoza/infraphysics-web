---
uid: "avBp6NIF"
address: "ML//Training//dataset//synthetic data"
name: "Synthetic Data"
date: "2024-01-20"
---
Teaching AIs with other AIs' homework: it works surprisingly well until the errors start compounding and nobody remembers what the original looked like.
- Risk of [[Mc4xR8wP|model collapse]]: errors compound across generations, diversity shrinks. [[Td5yK2jL|Tail distribution]] erodes first.
- But carefully curated synthetic data (math proofs, code with verification) works well: the key is external verification, not blind self-training.
- The uncomfortable question: what happens when most training data is AI-generated?
- [[mCK28lZ6|Constitutional AI]] uses synthetic data wisely: AI generates reflection-improved responses, but the constitution provides an external anchor.

## Interactions

- [[Mc4xR8wP|model collapse]] : : Recursive self-training is the mechanism, model collapse is the outcome: each generation smooths out what made the original distribution rich
