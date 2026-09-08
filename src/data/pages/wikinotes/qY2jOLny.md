---
uid: "qY2jOLny"
address: "ML//Inference//quantization"
name: "Quantization"
date: "2023-03-20"
---
Quantization represents model weights and sometimes activations or KV cache with fewer bits, for example moving from 16-bit floating point to 8-bit or 4-bit formats.

Fewer bits reduce storage and memory traffic. They can also increase throughput when the target hardware has efficient low-precision kernels. The price is approximation error, calibration complexity and occasional quality loss concentrated in particular tasks or layers. “Four-bit model” is therefore not a complete performance claim; format, method, hardware and workload all matter.

Quantization makes every number cheaper to carry. It still has to arrive somewhere useful.

## Interactions

- [[MemBand6|memory bandwidth]] : : Moving fewer bytes can accelerate inference that is limited by weight transfer
