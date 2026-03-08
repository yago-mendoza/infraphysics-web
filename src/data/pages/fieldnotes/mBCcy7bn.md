---
uid: "mBCcy7bn"
address: "ML//RNN"
name: "RNN"
date: "2018-04-12"
---
The architecture that tried to remember by passing notes to itself, one step at a time — then forgot what it wrote three steps ago. Processes sequences one token at a time, carrying hidden state forward.
- Hidden state carries "memory" from previous steps — exactly what you'd get if you saved enriched [[haA3MDhG|embeddings]] between [[Fw4pJ8mS|forward passes]]
- The problem: information from the beginning of the sequence dilutes exponentially (the [[7IHpnRNx|vanishing gradient]] problem). Can't parallelize (each step depends on the previous), slow to train.
- Transformers solved this by replacing recurrence with [[ml8njOQc|attention]] — every token sees every other token directly, no dilution chain.
- [[rK1Dy2Fa|LSTM]] gates partially mitigated the vanishing gradient, but couldn't match transformers at scale.
