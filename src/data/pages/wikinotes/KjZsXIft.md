---
uid: "KjZsXIft"
address: "ML//Transformer//tokenizer//BPE"
name: "BPE"
date: "2019-01-20"
---
Byte Pair Encoding: start with individual characters, iteratively merge the most frequent adjacent pair until target [[Vb8kM2nQ|vocabulary]] size.
- Simple greedy algorithm, surprisingly effective compression.
- GPT family uses BPE. The vocabulary is a frozen artifact of the training data.
- "running", "runner", "runs" share subword tokens → the model gets morphological hints for free, unlike char-level tokenization.
- Current trend: BPE with large vocabularies (~100K tokens). Balances sequence length against embedding sparsity.
