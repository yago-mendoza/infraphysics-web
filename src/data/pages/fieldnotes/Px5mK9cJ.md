---
uid: "Px5mK9cJ"
address: "ML//benchmark//perplexity"
name: "Perplexity"
date: "2026-02-25"
---
The standard metric for language model quality: 2^(cross-entropy loss). A perplexity of 10 means the model is "as confused as if it had to choose uniformly between 10 equally likely options" at each token.
- Directly derived from [[q3MjogvW|cross-entropy]]: perplexity = exp(loss). Lower loss = lower perplexity = better model. If you know the loss, you know the perplexity, and vice versa.
- Why not just use loss? Perplexity is more interpretable. A loss of 2.3 means nothing intuitive. A perplexity of 10 means "on average, the model narrows each token prediction down to about 10 candidates." Human-level English text has perplexity ~20-50 depending on the corpus.
- [[iTljPiGW|Scaling laws]] are usually plotted as loss vs compute, but perplexity is the metric practitioners report. When someone says "our model achieves 8.5 perplexity on WikiText-103", they're describing a [[d6uchFbH|benchmark]] result.
- Critical caveat: perplexity is [[zSFOpgNO|tokenizer]]-dependent. A model with BPE-50k and a model with BPE-100k have different perplexities on the same text because they're predicting different token sequences. Comparing perplexity across models with different tokenizers is misleading.
- Not useful for evaluating [[qcqxPFA0|SFT]] or [[0f5GJDwc|RLHF]] models directly: a helpful chatbot might have higher perplexity than a base model because it generates less "predictable" (more diverse, more specific) responses. Downstream [[d6uchFbH|benchmarks]] like [[vYejZdKc|MMLU]] or [[xJDUBSRn|GPQA]] measure what actually matters.

