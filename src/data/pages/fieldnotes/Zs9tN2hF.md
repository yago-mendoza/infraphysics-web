---
uid: "Zs9tN2hF"
address: "ML//GPT//GPT-3//zero-shot learning"
name: "Zero-Shot Learning"
date: "2026-03-01"
---
Solving a task with no examples, just an instruction. "Translate this to French: Hello" with zero demonstrations. The model relies entirely on its [[2oNdlB5L|pre-training]] knowledge to understand the task format.
- GPT-3 revealed the capability hierarchy: zero-shot < [[IdfB7mVS|few-shot]] < fine-tuned. But the gap between zero-shot and few-shot is often smaller than expected, especially for well-understood tasks.
- Why it works: during [[2oNdlB5L|pre-training]] on billions of tokens, the model encountered countless examples of translation, summarization, Q&A in natural format. Zero-shot just activates those learned patterns via the right prompt.
- [[pJmh7BBn|CLIP]] is zero-shot by design: it maps images and text into the same [[RnKMoC3a|latent space]], so it can classify any image by checking [[Cs3jT7bR|cosine similarity]] against arbitrary text labels it has never been trained on.
- The practical bridge to [[ovLF1FzI|prompt engineering]]: since zero-shot performance depends entirely on how you phrase the instruction, prompt engineering exists to close the gap between zero-shot and few-shot without needing examples.
- [[h7ZzT64Z|Emergent behavior]] often manifests as zero-shot capabilities: models below a certain scale can't do a task at all (even with examples), then suddenly larger models do it with zero examples.

## Interactions

- [[IdfB7mVS|Few-Shot Learning]] : : Zero-shot = instructions only, few-shot = instructions + examples. Few-shot "teaches by showing", zero-shot relies on the model already knowing the pattern from pre-training
- [[oBpGr85I|In-Context Learning]] : : In-context learning is the mechanism, zero-shot and few-shot are its modes. Zero-shot is the extreme case: the "context" is just the task description, with no exemplars
