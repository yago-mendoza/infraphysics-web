---
uid: "iqMWAjVA"
address: "ML//RAG//TF-IDF"
name: "TF-IDF"
date: "2026-02-26"
---
- Term Frequency–Inverse Document Frequency: classic document ranking from 1972
- TF: how often a term appears in a document. IDF: how rare the term is across all documents. Product = score
- Still a strong baseline for keyword search — [[2CN85TFL|BM25]] is essentially TF-IDF with better saturation and length normalization
- Part of the "boring IR" stack (TF-IDF, BM25, inverted indices) that production RAG still depends on
---
[[2CN85TFL|BM25]] :: BM25 is TF-IDF with better saturation — handles term frequency nonlinearly and normalizes for document length
