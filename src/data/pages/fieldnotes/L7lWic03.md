---
uid: "L7lWic03"
address: "ML//diffusion model//DiT"
name: "DiT"
date: "2026-02-26"
---
- Diffusion Transformer: replace the U-Net backbone in diffusion models with a standard [[QtZjVPKo|transformer]]
- [[ygZgTYwQ|Sora]], Flux, SD3 all use DiT variants. Transformers scale better than U-Nets at large model sizes
- Patch the image into tokens, apply transformer blocks, unpatch to reconstruct
- Architecture convergence: image generation now uses the same backbone as language models
---
[[QtZjVPKo|Transformer]] :: DiT brings the transformer into diffusion — replacing U-Nets with the same blocks that power LLMs
