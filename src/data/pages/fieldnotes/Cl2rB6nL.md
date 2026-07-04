---
uid: "Cl2rB6nL"
address: "ML//model//GPT//causal language modeling"
name: "causal language modeling"
date: "2026-03-06"
---
[[U7ljk7Wf|GPT]]'s training objective: predict the next token using only tokens to the left. No [[St5yK9jL|[MASK]]], no bidirectional context.
- Opposite of [[1zpNyBrj|MLM]] (BERT): MLM predicts hidden tokens from both sides, CLM predicts the future from the past.
- The [[Cm7jR4sQ|causal mask]] enforces this during training: each position can only attend to previous positions.
- Training produces T-1 examples from a sequence of T tokens: every position is a prediction target.
- The same objective from GPT-1 through GPT-4: scale the data, scale the model, same basic task.
