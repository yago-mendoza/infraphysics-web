---
uid: "KjZsXIft"
address: "ML//Transformer//tokenizer//BPE"
name: "BPE"
date: "2019-01-20"
---
- Byte Pair Encoding: start with individual characters, iteratively merge the most frequent adjacent pair
- Simple greedy algorithm, surprisingly effective compression
- GPT family uses BPE. The vocabulary is a frozen artifact of the training data.
