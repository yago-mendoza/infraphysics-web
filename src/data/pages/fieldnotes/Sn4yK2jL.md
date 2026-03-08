---
uid: "Sn4yK2jL"
address: "ML//Transformer//tokenizer//SentencePiece"
name: "SentencePiece"
date: "2026-03-06"
---
A language-agnostic tokenization library (Google, 2018) that treats text as a raw byte or Unicode stream, not pre-tokenized words. It learns a subword [[Vb8kM2nQ|vocabulary]] directly from raw text, without needing language-specific word boundary rules.
- Implements both [[KjZsXIft|BPE]] and Unigram algorithms. Most modern models use its BPE implementation. The key difference from earlier BPE tools (like GPT-2's tokenizer): SentencePiece doesn't require pre-tokenization (splitting on whitespace first), so it handles languages without spaces (Chinese, Japanese, Thai) natively.
- Used by [[Fyx8hGHL|LLaMA]], [[T5m3K7jR|T5]], and most multilingual models. The whitespace-agnostic design is why these models handle non-English text better than GPT-2/3 (which assumed English-like word boundaries)
- The "sentencepiece model" (.model file) contains the learned vocabulary and merge rules. It's fully self-contained: no external dictionaries or language-specific logic. This makes it easy to share [[zSFOpgNO|tokenizers]] across different codebases and frameworks.
- Relationship to [[By2tN6hF|byte-level models]]: SentencePiece can operate at the byte level (byte-fallback mode), ensuring 100% coverage of any input. Unknown characters get decomposed into UTF-8 bytes, each mapped to a special byte token. This eliminates the "unknown token" problem entirely.
- The [[Vb8kM2nQ|vocabulary]] size trade-off: larger vocab (32K-100K) means more concepts are single tokens (efficient), but the [[Em3xR7wP|embedding matrix]] grows proportionally (more parameters). Smaller vocab means more tokens per concept (slower generation) but a smaller model. Most LLMs settle on 32K-128K tokens.

