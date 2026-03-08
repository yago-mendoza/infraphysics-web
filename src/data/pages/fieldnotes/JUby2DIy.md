---
uid: "JUby2DIy"
address: "ML//Transformer//context window"
name: "Context Window"
date: "2020-08-22"
---
The finite number of tokens the model can see at once — attention is O(n²), so doubling context = 4x memory and compute.
- GPT-2: 1024. GPT-3: 2048. GPT-4: 8K-128K. Claude: 100K-200K.
- Everything outside the window doesn't exist for the model — no memory, no persistence.
- Why [[yK3RLt0K|RAG]] matters: fetch relevant info on demand instead of fitting everything in the window.
- [[Fa9tL3hP|Flash Attention]] enables longer windows at the same hardware by avoiding N×N memory materialization.
- [[Sw3pJ7cR|Sliding window attention]] trades full attention for O(n×w) — a compromise, not infinite context.
