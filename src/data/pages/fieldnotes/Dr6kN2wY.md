---
uid: "Dr6kN2wY"
address: "ML//neural network//embedding//directionality"
name: "Directionality"
date: "2026-03-02"
---
Directions in [[haA3MDhG|embedding]] space encode semantic relationships: king - man + woman ≈ queen (gender direction), cat → cats (plural direction)
- Dot product = 0 means perpendicular = unrelated. High dot product = aligned = semantically connected.
- These directions emerge during training — not hand-designed. The model discovers its own feature geometry.
- The 12K+ dimensions of a typical embedding encode thousands of overlapping directional relationships simultaneously.
- This is why [[Cs3jT7bR|cosine similarity]] works for search: similar concepts point in similar directions.
