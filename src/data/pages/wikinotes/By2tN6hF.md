---
uid: "By2tN6hF"
address: "ML//Transformer//tokenizer//byte-level model"
name: "Byte-Level Model"
date: "2026-02-24"
---
Models that tokenize at the byte level (256 possible tokens) instead of subwords.
- ByT5 and MegaByte (Meta, 2023), real research, not just theory.
- Sequence ~4x longer than characters, ~16x more expensive than chars, ~100x more expensive than [[KjZsXIft|BPE]] (attention is O(n²))
- The bet: at byte level the model learns optimal compression without tokenizer biases: perfect handling of typos, new languages, invented words, code. Zero out-of-vocabulary tokens ever.
- The cost is prohibitive for large models today. Direction of research, not production.
- MegaByte's approach: local attention over byte patches + global attention between patches, reducing the quadratic cost.
