---
uid: "qY2jOLny"
address: "ML//inference//quantization"
name: "quantization"
date: "2023-03-20"
aliases: ["INT8", "INT4", "GPTQ", "AWQ", "post-training quantization"]
---
Quantization stores a model's numbers with fewer bits than they were trained in. A weight kept in 16-bit floating point becomes an 8-bit or 4-bit integer plus a scale factor shared by a block of neighbours; at run time the integer is multiplied back by the scale, so the model computes with an approximation of every weight rather than the weight itself. The trade is precision for bytes, and the reason the trade pays is where the bytes go.

Token-by-token generation moves the entire weight matrix through the memory bus to produce a handful of arithmetic operations per byte, so [[Rx5QMqad|inference]] is usually limited by [[MemBand6]] rather than by compute. Halving the bytes halves the traffic, and a 4-bit model can decode close to twice as fast as an 8-bit one on the same GPU even though the arithmetic has not changed. The same reduction shrinks the [[VramMem5]], which is what lets a 70-billion-parameter model fit on a single consumer card.

- The error is not uniform. A few weights and activations are outliers, orders of magnitude larger than their neighbours, and a scale chosen to hold them wastes most of the grid on the rest. Every serious method is a way of handling outliers: LLM.int8() keeps them in 16 bits and quantizes the rest; GPTQ picks the rounding of each column so that the error it introduces is compensated by later columns, using second-order information from a small calibration set; AWQ scales the channels the activations care about most before rounding. Per-group scales (one scale per 32 or 128 weights) are the cheap version of the same idea.
- Post-training quantization needs only the finished model and a few hundred calibration samples, and runs in minutes; quantization-aware training simulates the rounding during training so the weights learn to live on the grid, at the price of a training run. Almost every published 4-bit checkpoint is the first kind.
- What gets quantized matters as much as how many bits. Weight-only quantization helps decode because weights are the traffic; quantizing activations too is what unlocks integer matrix units on the hardware, and is harder because activations carry the outliers. The [[89ceVDr1]] is the third target: at long contexts it outgrows the weights, and quantizing it trades a little accuracy for many more concurrent sequences.
- "A four-bit model" is not a performance claim. The bits say how the numbers are stored; the speed depends on whether the target hardware has kernels for that format, and the quality depends on the method, the calibration data and the task. Losses are usually invisible in perplexity and concentrated in the tails: arithmetic, long-context recall, rare languages.

## Interactions

- [[MemBand6|memory bandwidth]] : : Quantization speeds up decoding only to the extent that decoding is bandwidth-bound; on a compute-bound workload (large batches, prefill) fewer bits buy memory, not time
