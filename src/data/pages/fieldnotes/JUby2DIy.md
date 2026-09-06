---
uid: "JUby2DIy"
address: "ML//Transformer//context window"
name: "Context Window"
date: "2020-08-22"
---
A program has RAM; an LLM inference has a **context window**: the finite token budget available to the model for that generation.

Anything outside it is not directly observable. A surrounding system must retrieve, summarize or reintroduce that information, which is why [[yK3RLt0K|RAG]] and [[CtxEng42|context engineering]] matter.

For dense self-attention, attention scores grow quadratically with sequence length. Implementations such as [[Fa9tL3hP|Flash Attention]] reduce memory traffic without making context free, while [[Sw3pJ7cR|sliding-window attention]] exchanges global visibility for cheaper local attention.

The practical constraint is not merely maximum length. A large window can still bury the useful evidence among irrelevant tokens.

## Interactions

- [[CtxEng42|context engineering]] : : Context engineering decides which information deserves scarce attention even when nominal capacity is large
- [[VramMem5|model memory footprint]] : : Context length and concurrent requests can make runtime state larger than the compressed model weights
