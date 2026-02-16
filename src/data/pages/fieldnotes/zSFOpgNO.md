---
uid: "zSFOpgNO"
address: "ML//Transformer//tokenizer"
name: "tokenizer"
date: "2018-09-10"
---
- Breaks text into subword tokens: "unbelievable" → "un" + "believ" + "able"
- Vocabulary size tradeoff: small (8K) = more tokens per sentence, large (100K) = sparser but shorter sequences
- [[KjZsXIft|BPE]] is the most common algorithm. WordPiece (BERT) and SentencePiece are alternatives.
