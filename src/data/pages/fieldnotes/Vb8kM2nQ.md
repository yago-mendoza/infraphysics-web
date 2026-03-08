---
uid: "Vb8kM2nQ"
address: "ML//Transformer//tokenizer//vocabulary"
name: "Vocabulary"
date: "2026-03-01"
---
The finite set of tokens the model knows — every possible subword unit it can produce or consume.
- Size tradeoff: small vocab (8K) = longer sequences, more context spent per sentence. Large vocab (100K) = shorter sequences, sparser embeddings.
- [[KjZsXIft|BPE]] builds the vocabulary greedily from character-level up: merge most frequent pairs until you hit target size.
- The vocabulary is a frozen artifact of the training data — fixed at pre-training time, never touched during [[esHo5jMx|fine-tuning]]
- Determines the shape of the [[Em3xR7wP|embedding matrix]]: rows = vocab size, columns = embedding dimension.
