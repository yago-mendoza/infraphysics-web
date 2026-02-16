---
uid: "1zpNyBrj"
address: "ML//BERT//masked language modeling"
name: "masked language modeling"
date: "2019-01-20"
---
- Mask 15% of input tokens randomly, train the model to predict them from context
- Deceptively simple — forces genuine bidirectional understanding
- The model can't just copy from left-to-right; it has to reason about the masked position from surrounding words
