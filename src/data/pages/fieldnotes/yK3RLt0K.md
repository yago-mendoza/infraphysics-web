---
uid: "yK3RLt0K"
address: "ML//RAG"
name: "RAG"
date: "2026-02-15"
---
- Retrieval-augmented generation — before answering, the model retrieves relevant documents and stuffs them into the context window alongside the question
- Sources: web search, databases, PDFs, whatever — retrieved from a [[TIQNpwbS|vector database]]
- Training is expensive and slow — RAG is cheap, instant, pure context window manipulation
- The dark side: if the retrieved documents are garbage, the model will confidently synthesize garbage — RAG is only as smart as its search engine
---
[[Rx5QMqad|Inference]] :: RAG injects knowledge at inference time — no weight changes, just expanded context
[[2oNdlB5L|Pre-training]] :: pre-training bakes knowledge into weights permanently; RAG provides it on-demand without training
