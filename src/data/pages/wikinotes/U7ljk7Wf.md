---
uid: "U7ljk7Wf"
address: "ML//model//GPT"
name: "GPT"
date: "2026-02-15"
---
[[Dc8sW4nR|Decoder]]-only. No [[En6fL2qY|encoder]], no [[LZEkMuDa|cross-attention]]. If it translates, it learned translation as a pattern during [[2oNdlB5L|pre-training]], not from a dedicated encoder.
- Trained with [[Cl2rB6nL|causal language modeling]]: predict next token using only previous tokens.

##### Evolution

- GPT-1 (2018): [[2oNdlB5L|pre-training]] + [[qcqxPFA0|SFT]], but SFT for specific tasks like classification, not for chatting.
- GPT-2: pure pre-training. OpenAI wanted to see if it learned just from volume, no public fine-tuning.
- GPT-3: pure pre-training, massive. Predicted text beautifully but didn't follow instructions.
- InstructGPT / GPT-3.5: the inflection point. Took GPT-3 and added SFT + [[0f5GJDwc|RLHF]], birth of the "assistant".
- GPT-4 / GPT-4o: pre-training + SFT + RLHF + RLAIF, same pipeline but scaled, using AIs to help score and correct.
- Doesn't use [[St5yK9jL|[CLS]]], simply takes the last token (already optimized to carry full sequence meaning via [[Cm7jR4sQ|causal masking]])

## Interactions

- [[bNGmRCsR|Training]] : : The GPT family tracks the evolution of training techniques: each generation added a new layer to the pipeline
- [[0f5GJDwc|RLHF]] : : InstructGPT was the first model to use RLHF at scale. Proved that human preference training transforms raw language models into useful assistants
