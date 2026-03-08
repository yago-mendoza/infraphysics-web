---
uid: "yK3RLt0K"
address: "ML//RAG"
name: "RAG"
date: "2026-02-15"
---
Retrieval-augmented generation — before answering, retrieve relevant documents and stuff them into the [[JUby2DIy|context window]] alongside the question.
- Sources: web search, databases, PDFs — retrieved from a [[TIQNpwbS|vector database]] using [[Cs3jT7bR|cosine similarity]]
- Powered by [[Sr7tD3vH|sentence transformers]]: [[MwbJnjdN|BERT]] fine-tuned with [[Ct9xL5mW|contrastive learning]] so that [CLS] captures semantic similarity instead of just predicting masks.
- [[U7ljk7Wf|GPT]] doesn't use [CLS] — it takes the last token as the embedding (optimized via [[Cm7jR4sQ|causal masking]] to carry full meaning)
- Training is expensive and slow — RAG is cheap, instant, pure context window manipulation.
- The dark side: if the retrieved documents are garbage, the model will confidently synthesize garbage — RAG is only as smart as its search engine.

## Interactions

- [[Rx5QMqad|Inference]] : : RAG injects knowledge at inference time — no weight changes, just expanded context
- [[2oNdlB5L|Pre-training]] : : Pre-training bakes knowledge into weights permanently; RAG provides it on-demand without training
