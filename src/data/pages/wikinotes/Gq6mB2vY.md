---
uid: "Gq6mB2vY"
address: "ML//Transformer//attention//GQA"
name: "GQA"
date: "2026-03-05"
---
Grouped Query Attention: instead of separate K, V per [[Hd4nK8xS|head]], share K and V across groups of heads.
- Standard MHA: 96 heads = 96 Q + 96 K + 96 V. GQA with 8 groups: 96 Q + 8 K + 8 V.
- Drastically reduces [[89ceVDr1|KV cache]] size: the cache grows per K/V pair, not per head.
- Llama 3, Gemini use GQA. Minimal quality loss, major memory savings at inference.
- MQA (Multi-Query Attention) is the extreme: ALL heads share a single K, V pair. GQA is the practical middle ground.
