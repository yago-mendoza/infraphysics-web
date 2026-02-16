---
uid: "l3B9q1cM"
address: "ML//RAG//chunking strategy"
name: "chunking strategy"
date: "2024-03-15"
---
- How you split documents for [[haA3MDhG|embedding]] and retrieval
- Fixed-size chunks miss semantic boundaries. Recursive splitting (paragraphs → sentences) is better.
- Overlap between chunks prevents losing context at edges
- Chunk size trades precision vs recall — small chunks match better but lose surrounding context
