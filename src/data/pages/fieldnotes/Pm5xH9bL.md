---
uid: "Pm5xH9bL"
address: "ML//Transformer//attention//projection matrices"
name: "Projection Matrices"
date: "2026-03-08"
---
The learned weight matrices that create [[Qk3vT7mJ|Q, K, V]] from raw embeddings:
- **W_Q**: projects embeddings into query space (what to look for)
- **W_K**: projects into key space (what to advertise)
- **W_V**: projects into value space (what to transmit). Learns selective compression: only the subspace useful for this [[Hd4nK8xS|head]]
- **W_O**: output projection, recombines all heads' outputs back to model dimension.
- Each [[Hd4nK8xS|head]] has its own W_Q, W_K, W_V (initialized randomly → [[aufHHy2p|backprop]] pushes them to specialize)
- [[3kgsj4Y4|LoRA]] is typically applied to these matrices (especially W_Q, W_K, W_V, W_O): attention is where behavior changes most with fewest parameters.
- Dimensions: model_dim → head_dim (e.g. 12288 → 128 per head in GPT-3)
