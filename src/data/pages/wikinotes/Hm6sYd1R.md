---
uid: "Hm6sYd1R"
address: "ML//Alignment//mechanistic interpretability//activation verbalizer"
name: "Activation Verbalizer"
date: "2026-04-08"
---
A technique for translating numerical activation vectors from intermediate model layers into natural language descriptions; reading what neurons "think."
- Operates on the [[Rs6cD4vX|residual stream]] at intermediate layers: extracts the activation vector at a given position and maps it to human-readable text.
- Complementary to [[Sa4vB8mQ|sparse autoencoders]] but different in method: SAEs decompose activations into a sparse dictionary of known [[Ft9pL5hS|features]]; verbalizers produce open-ended natural language summaries of what an activation vector "contains."
- Also complementary to contrastive vector probing. Probing activates the model with contrastive pairs, subtracts activation vectors, and translates the resulting difference vector to measure alignment with a test concept. Verbalizers read individual activations directly without requiring a contrast.
- Used in the Mythos system card alongside SAEs for monitoring: SAEs identified features like "strategic manipulation" or "concealment"; verbalizers provided narrative descriptions of the model's latent reasoning.
- In the Mythos experiments, SAEs were trained on a single layer at approximately two-thirds of the model's depth (for [[Ft9pL5hS|feature]] identification). [[Qv7mXk2N|Activation steering]], by contrast, operates across all layers simultaneously (for behavior modification). Different tools, different insertion points, different purposes.

## Interactions

- [[Sa4vB8mQ|Sparse Autoencoder]] : : SAEs decompose into a fixed dictionary of features (structured, discrete); verbalizers produce free-form natural language (unstructured, continuous). SAEs tell you which features are active; verbalizers tell you what the activation "means" in open-ended terms
