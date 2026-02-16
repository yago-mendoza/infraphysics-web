---
uid: "T9kOs8YY"
address: "ML//Inference//speculative decoding"
name: "speculative decoding"
date: "2023-11-10"
---
- Use a small draft model to predict several tokens ahead, verify with the large model in one forward pass
- If the draft is right (common for easy tokens like "the", "is"), you get multiple tokens per step
- Free speedup with zero quality loss — the large model's distribution is preserved exactly
