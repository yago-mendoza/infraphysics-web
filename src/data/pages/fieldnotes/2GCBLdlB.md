---
uid: "2GCBLdlB"
address: "ML//Transformer//LM head"
name: "LM Head"
date: "2026-02-15"
---
The final layer that converts the last vector of the [[Rs6cD4vX|residual stream]] into [[Lg7cD3vX|logits]] over the [[Vb8kM2nQ|vocabulary]]
- Pipeline: [[Rs6cD4vX|residual stream]] [768 dims] → LM head (W_E transposed) → logits [50K vocab] → [[Sm8rH4nW|softmax]] → token.
- The input is called the **final hidden state** (or last hidden state) — the residual stream vector after all N layers, before this projection.
- Wu IS the [[Em3xR7wP|embedding matrix]] transposed ([[Wt9rB5kH|weight tying]]) — the same parameters that encode tokens also decode the output.
- Each row represents a token in the vocabulary — the dot product between the final hidden state and each row = "how aligned is this representation with each possible next token".
- Wu is as wide as the last embedding dimension — the [[zSFOpgNO|tokenizer]]/embedding size determines the bottleneck.

## Interactions

- [[Rs6cD4vX|residual stream]] : : The residual stream's final hidden state is LM head's input — the accumulated result of all attention and MLP layers
- [[RnKMoC3a|latent space]] : : The final hidden state lives in latent space — LM Head projects it into vocabulary space
