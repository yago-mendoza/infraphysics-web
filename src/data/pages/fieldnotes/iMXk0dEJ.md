---
uid: "iMXk0dEJ"
address: "ML//Inference//Sampling//top-k"
name: "top-k"
date: "2020-10-15"
---
- Only consider the k most probable next tokens, zero out the rest
- k=1 is greedy, k=50 is common. Cuts the long tail of unlikely tokens.
