---
uid: "Wt9rB5kH"
address: "ML//Transformer//weight tying"
name: "Weight Tying"
date: "2026-03-05"
---
One matrix, two jobs — the same table that translates words into vectors also translates vectors back into words, just transposed. The [[Em3xR7wP|embedding matrix]] E that converts token IDs into vectors is reused, transposed, as the [[2GCBLdlB|LM head]] that converts the final vector back into vocabulary scores.
- Conceptually elegant: embedding = "what does this token mean in vector space", LM head = "which token is closest to this vector in the same space".
- Reduces parameter count significantly — the embedding matrix is huge (vocab_size × dim)
- Works because the model learns to place semantically similar tokens near each other in the shared space.
- The last vector has been refined through so many layers that it "knows" exactly what it is relative to the entire vocabulary — sufficient to predict next.
