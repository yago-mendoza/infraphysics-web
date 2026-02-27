---
uid: "sVU0yORc"
address: "ML//Multimodal//LLaVA"
name: "LLaVA"
date: "2026-02-26"
---
- Large Language and Vision Assistant: the "late fusion" approach to visual language models
- Architecture: [[pJmh7BBn|CLIP]] vision encoder + linear projection + [[Fyx8hGHL|LLaMA]] language model. Simple, cheap, effective
- Visual instruction tuning: fine-tune on image-text pairs where the text includes instructions
- Spawned a huge family: LLaVA-1.5, LLaVA-NeXT, plus countless variants. The "Alpaca moment" for multimodal
---
[[pJmh7BBn|CLIP]] :: LLaVA uses CLIP as its vision encoder — CLIP extracts image features, a linear layer projects them into the LLM's embedding space
