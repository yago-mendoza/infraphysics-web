---
uid: "JUby2DIy"
address: "ML//Transformer//context window"
name: "context window"
date: "2020-08-22"
---
- The finite number of tokens the model can see at once
- GPT-2: 1024. GPT-3: 2048. GPT-4: 8K-128K. Claude: 100K-200K.
- Everything outside the window doesn't exist for the model — no memory, no persistence
- Why [[yK3RLt0K|RAG]] matters: fetch relevant info on demand instead of fitting everything in the window
