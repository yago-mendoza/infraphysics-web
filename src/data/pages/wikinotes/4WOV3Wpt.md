---
uid: "4WOV3Wpt"
address: "ML//Transformer//encoder-decoder"
name: "Encoder-Decoder"
date: "2018-08-20"
---
The original Transformer architecture: [[En6fL2qY|encoder]] processes input bidirectionally, [[Dc8sW4nR|decoder]] generates output autoregressively.
- Encoder: [[vCs7RZqL|self-attention]] without masking (all tokens see all). Decoder: self-attention with [[Cm7jR4sQ|causal masking]] + [[LZEkMuDa|cross-attention]] to encoder.
- T5 kept this structure. [[U7ljk7Wf|GPT]] dropped the encoder (decoder-only). [[MwbJnjdN|BERT]] dropped the decoder (encoder-only)
- The architectural split that defined the field: generation vs understanding.
- Translation example: encoder processes "El gato duerme" (full bidirectional understanding), decoder generates "The cat sleeps" autoregressively, attending to the encoder via cross-attention at each step.
