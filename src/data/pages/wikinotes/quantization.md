---
slug: quantization
uid: "qY2jOLny"
address: "ML//inference//quantization"
name: "quantization"
date: "2023-03-20"
aliases: ["INT8", "INT4", "post-training quantization"]
---
Quantization stores a model's numbers with fewer bits than they were trained in. A weight that lives in 16-bit floating point is rounded to the nearest value on a coarser grid of 8-bit or 4-bit integers (each integer comes with a scale factor, shared with the weights around it, that says how far apart the grid points are). When the model runs, it multiplies the integer back by the scale and works with that rounded value in place of the original. So the network is the same network with every weight nudged a little, and the question is what the nudging buys.

It buys bytes, and bytes are the bottleneck of generation. Producing one token means streaming the whole weight matrix through the memory bus for a handful of arithmetic operations per byte, so [[Rx5QMqad]] is limited by [[MemBand6]] far more often than by compute.

{bkqt/keyconcept}
Halving the bytes halves the traffic. A 4-bit model can decode close to twice as fast as an 8-bit one on the same [[WEUTQwqv]], even though the arithmetic has not changed, and the same reduction shrinks the [[VramMem5]] enough to fit a 70-billion-parameter model on a single consumer card.
{/bkqt}

- Post-training quantization takes the finished model and a few hundred calibration samples and runs in minutes; quantization-aware training simulates the rounding during training so the weights learn to live on the grid, at the price of a training run. Almost every published 4-bit checkpoint is the first kind.
- What gets quantized matters as much as how many bits. Weight-only quantization helps decoding because weights are the traffic; quantizing the activations too is what unlocks the integer matrix units on the hardware, and is harder, because activations contain a few extreme values that a coarse grid handles badly. The [[89ceVDr1]] is the third target: at long contexts it outgrows the weights, and quantizing it trades a little accuracy for many more concurrent sequences.
- Calling a model *four-bit* says how its numbers are stored, not how well it runs. The speed depends on whether the target hardware has kernels for that format, and the quality depends on the method, the calibration data and the task. Losses tend to be invisible in perplexity and concentrated in the tails: arithmetic, long-context recall, rare languages.

## Interactions

- [[MemBand6|memory bandwidth]] : : Quantization speeds up decoding only to the extent that decoding is bandwidth-bound; on a compute-bound workload (large batches, prefill) fewer bits buy memory, not time
