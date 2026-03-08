---
uid: "Ns8fH4xP"
address: "ML//BERT//next sentence prediction"
name: "Next Sentence Prediction"
date: "2026-03-02"
---
The pre-training objective that got fired — BERT shipped with it, then RoBERTa proved everyone was better off without it. BERT's second pre-training objective alongside [[1zpNyBrj|MLM]]: given sentence pair (A, B), predict if B actually follows A in the original text.
- Binary classification: "is next" vs "not next" — 50% real pairs, 50% random.
- Later discovered to not contribute much — models like RoBERTa dropped NSP entirely and performed better.
- The intuition was that it would teach sentence-level reasoning, but [[1zpNyBrj|MLM]] alone turned out to capture this sufficiently.
