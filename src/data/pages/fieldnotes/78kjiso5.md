---
uid: "78kjiso5"
address: "ML//RNN//sequence-to-sequence"
name: "sequence-to-sequence"
date: "2018-06-15"
---
- Encoder RNN compresses input to a fixed-size vector, decoder RNN generates output from it
- The architecture behind early Google Translate
- Bottleneck: entire input squeezed into one vector — [[ml8njOQc|attention]] was invented to fix this
---
[[4WOV3Wpt|encoder-decoder]] :: the Transformer encoder-decoder replaced seq2seq with parallel attention, keeping the encode→decode structure but dropping recurrence
