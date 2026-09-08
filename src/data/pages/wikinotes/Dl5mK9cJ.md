---
uid: "Dl5mK9cJ"
address: "ML//model//BERT//downstream layer"
name: "downstream layer"
date: "2026-02-25"
---
A simple linear layer on top of [[MwbJnjdN|BERT]]'s output that converts the embedding vector into task-specific predictions.
- Always found after an [[En6fL2qY|encoder]]: takes the pre-trained representation and adapts it.
- Examples: 2 classes for sentiment analysis, similarity score for [[yK3RLt0K|RAG]], NER tags per token, entailment classification.
- "Downstream" = the task-specific part that comes after the general-purpose encoder.
- The [[St5yK9jL|[CLS]]] token's vector is typically the input to downstream layers for sentence-level tasks.
