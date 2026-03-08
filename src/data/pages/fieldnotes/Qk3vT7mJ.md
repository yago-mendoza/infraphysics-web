---
uid: "Qk3vT7mJ"
address: "ML//Transformer//attention//Q, K, V"
name: "Q, K, V"
date: "2026-03-07"
---
Three roles every token plays simultaneously in [[ml8njOQc|attention]]:
- **Query** (Q): "what am I looking for?" — each token broadcasts a 128-dim question via W_Q.
- **Key** (K): "what do I have to offer?" — each token advertises its relevance via W_K.
- **Value** (V): "what information do I carry?" — the actual content that flows if attention fires, via W_V.
- Q·K (dot product) measures alignment between what one token seeks and what another offers → [[Dp2kN6wF|attention scores]]
- Why can't V just be the original embedding? Because [[Pm5xH9bL|W_V]] learns to extract only the subespace relevant for this [[Hd4nK8xS|head]] — "banco" attending to "río" should receive river-related features, not all of "río".
- Each [[Hd4nK8xS|head]] has its own Q, K, V — different learned projections, different questions asked.
