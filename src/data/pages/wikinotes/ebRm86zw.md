---
uid: "ebRm86zw"
address: "ML//RAG//hybrid search"
name: "Hybrid Search"
date: "2024-03-15"
---
- Combine [[TIQNpwbS|vector]] similarity (semantic) with keyword matching (BM25)
- Neither alone is sufficient: vectors miss exact terms, keywords miss meaning.
- Reciprocal rank fusion merges the two ranked lists.
- Most production RAG systems use hybrid search.
