---
uid: "1zpNyBrj"
address: "ML//BERT//masked language modeling"
name: "Masked Language Modeling"
date: "2019-01-20"
---
Mask 15% of input tokens randomly with [[St5yK9jL|[MASK]]], train the model to predict them from context of both sides.
- Deceptively simple — forces genuine bidirectional understanding.
- NOT like [[Cl2rB6nL|causal language modeling]] (GPT): GPT predicts the next token left-to-right, MLM predicts hidden tokens in any position using full bidirectional context.
- The model can't just copy from left-to-right; it has to reason about the masked position from surrounding words.
- Output: one prediction per masked position. The model uses the full context (past AND future tokens) to disambiguate.
