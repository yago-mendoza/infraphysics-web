---
uid: "Rs6cD4vX"
address: "ML//Transformer//residual stream"
name: "Residual Stream"
date: "2026-03-05"
---
The "highway" that carries information through the entire transformer: the vector that gets iteratively modified by [[ml8njOQc|attention]] and [[Pr8dt3wz|MLP]] blocks via [[dTnuW5yO|residual connections]]
- Each layer reads from the stream, computes a delta (attention or MLP), and writes back: stream = stream + attention(stream) then stream = stream + MLP(stream)
- Dimension: typically 768 (GPT-2) to 12288 (GPT-3). Fixed width from [[Em3xR7wP|embedding matrix]] input to [[2GCBLdlB|LM head]] output.
- The **final hidden state** (aka last hidden state) = the residual stream vector after all N layers, before the LM head. This is the vector that gets multiplied by the [[Em3xR7wP|embedding matrix]] transposed to produce [[Lg7cD3vX|logits]]
- **Path dependency**: once the model starts generating in a direction, each token becomes context that shifts the stream further along that trajectory. Wrong tokens push into unfamiliar territory — an attractor that's hard to escape. This is how [[Eb4kN7xS|exposure bias]] manifests mechanistically.
- The residual stream IS the [[RnKMoC3a|latent space]] trajectory — each layer moves the vector to a new point in this high-dimensional space.
- Why it matters for [[UHGnehtS|mechanistic interpretability]]: every layer's contribution is an additive delta — you can read off what each [[Hd4nK8xS|attention head]] or MLP layer added. [[Ih8nK5xW|Induction heads]] are the proof: their pattern-copying deltas are identifiable in the stream.

