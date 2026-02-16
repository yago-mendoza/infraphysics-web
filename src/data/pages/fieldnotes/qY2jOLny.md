---
uid: "qY2jOLny"
address: "ML//Inference//quantization"
name: "quantization"
date: "2023-03-20"
---
- Reduce weight precision: FP16 → INT8 → INT4
- Model gets 2-4× smaller, runs faster. Accuracy loss is surprisingly small.
- GPTQ, AWQ, GGUF — different methods, same idea: most weights don't need 16 bits
- Why you can run a 7B model on a laptop with 8GB RAM
