---
uid: "Gk5pJ7mS"
address: "ML//Inference//greedy decoding"
name: "Greedy Decoding"
date: "2026-03-02"
---
Always pick the best-looking option right now, and hope the sequence works itself out. At each [[Ds4pJ8kF|decoding step]], pick the single token with the highest probability from the [[Lg7cD3vX|logits]]. No randomness, no exploration, always the argmax.
- Fast (one forward pass per token, no branching) and deterministic (same input always produces same output). This makes it useful for benchmarking and tasks where reproducibility matters.
- The fundamental problem: locally optimal choices do not equal globally optimal sequences. Picking the best token at each step can lead to a worse overall sequence than if you'd chosen a slightly less probable token early on.
- For [[78kjiso5|seq2seq]] tasks (translation, summarization), greedy decoding produces acceptable but mediocre output. [[Bs8fH2xP|Beam search]] consistently outperforms it by exploring multiple paths.
- For open-ended LLM generation, greedy decoding produces repetitive, boring text. It gravitates toward high-frequency phrases because these are always the most probable next tokens. [[5qpyTXdv|Sampling]] with [[Pr11SIS0|temperature]] and [[9Tlb16K2|top-p]] solves this by introducing controlled randomness.

##### When to use

- In practice, greedy decoding is the hidden default: when you set temperature=0 in an API call, you're requesting greedy decoding. It's the "safe" mode for tasks where creativity isn't wanted (code generation, factual Q&A)

## Interactions

- [[Bs8fH2xP|Beam Search]] : : Greedy is beam search with beam width 1. Beam search explores K paths where greedy explores 1, trading compute for better global sequences
- [[5qpyTXdv|Sampling]] : : Greedy picks the maximum, sampling draws from the distribution. Greedy is deterministic and repetitive, sampling is stochastic and diverse. Temperature=0 is greedy, temperature>0 is sampling
