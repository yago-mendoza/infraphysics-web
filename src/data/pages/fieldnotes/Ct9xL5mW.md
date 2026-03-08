---
uid: "Ct9xL5mW"
address: "ML//Training//contrastive learning"
name: "Contrastive Learning"
date: "2026-03-08"
---
Train with pairs and triplets: (query, positive match, negative match). Push positive pairs closer in vector space, pull negative pairs apart.
- Example for [[yK3RLt0K|RAG]]: "Capital of France?" + "Paris is the capital" → high [[Cs3jT7bR|cosine similarity]]. "Capital of France?" + "Tortilla recipe" → low similarity.
- The loss function that makes [[Sr7tD3vH|sentence transformers]] work — transforms [[MwbJnjdN|BERT]]'s [CLS] vector from "predicts masked tokens" to "captures semantic similarity".
- [[MwbJnjdN|BERT]] base without contrastive fine-tuning does semantic search mediocremente — the [CLS] wasn't optimized for similarity.
- Also used in [[pJmh7BBn|CLIP]] (text-image pairs), self-supervised learning, and representation learning broadly.
