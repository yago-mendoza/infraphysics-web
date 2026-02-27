---
uid: "hqUDso8y"
address: "ML//prompt tuning"
name: "prompt tuning"
date: "2026-02-26"
---
- Train a small set of continuous "soft prompt" vectors prepended to the input, keep the model frozen
- Prefix-tuning: soft prompts at every layer. Prompt tuning (Lester et al.): only at the input [[haA3MDhG|embedding]] layer
- Much cheaper than [[esHo5jMx|fine-tuning]] — only the prompt vectors are trainable (a few thousand parameters)
- A learned prompt embedding can outperform hand-written prompts, especially on classification tasks
---
[[ovLF1FzI|prompt engineering]] :: prompt tuning replaces hand-crafted text with learned vectors — same goal (steer the model) but the "prompt" is continuous, not discrete tokens
