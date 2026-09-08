---
uid: "zSFOpgNO"
address: "ML//Transformer//tokenizer"
name: "Tokenizer"
date: "2018-09-10"
---
Breaks text into subword tokens: "unbelievable" → "un" + "believ" + "able". Input into pieces = tokens (also chunks of image, or sound)
- Two separate steps: tokenizer (algorithm, not a NN) splits text → assigns token IDs. [[Em3xR7wP|Embedding matrix]] converts IDs → vectors. "gato" → token_id 4821 → vector[512 dims].
- [[Vb8kM2nQ|Vocabulary]] size tradeoff: small (8K) = more tokens per sentence, large (100K) = sparser but shorter sequences.
- [[KjZsXIft|BPE]] is the most common algorithm. WordPiece ([[MwbJnjdN|BERT]]) and SentencePiece are alternatives.
- Almost never touched in [[esHo5jMx|fine-tuning]]: changing it means changing the [[Em3xR7wP|embedding matrix]], basically starting over.
- What if chars instead of subwords? "transformer" = 2-3 BPE tokens vs 11 chars. 3x less text per [[JUby2DIy|context window]]. Model must learn morphology from scratch ("running"/"runner"/"runs" lose shared subwords). But: perfect typo handling, new languages, code. Trade-off favors BPE at current scale.
