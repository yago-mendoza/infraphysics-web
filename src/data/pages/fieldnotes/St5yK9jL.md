---
uid: "St5yK9jL"
address: "ML//Transformer//tokenizer//special tokens"
name: "Special Tokens"
date: "2026-03-08"
---
Tokens with structural meaning, not linguistic meaning:
- [CLS] — [[MwbJnjdN|BERT]]'s aggregation token. Sits at position 0, learns to capture global sentence meaning during training. Used for classification tasks via [[Dl5mK9cJ|downstream layers]]
- [MASK] — placeholder for [[1zpNyBrj|masked language modeling]]. The model predicts what goes here using bidirectional context.
- [BOS] — beginning of sequence. In [[LZEkMuDa|cross-attention]] translation, the Q from [BOS] is the "cold start" — how do you attend to the source language when you haven't generated anything yet?
- [EOS] — end of sequence. When the model generates this token, inference stops.
- [[U7ljk7Wf|GPT]] doesn't use [CLS] — it simply takes the last token's representation (already optimized to carry full sequence meaning via [[Cm7jR4sQ|causal masking]])
