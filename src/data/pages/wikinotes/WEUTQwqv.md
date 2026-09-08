---
uid: "WEUTQwqv"
address: "Hardware//GPU"
name: "GPU"
date: "2026-02-05"
---
A GPU is a massively parallel processor designed to apply similar operations across large collections of data. Graphics supplied the original workload; matrix-heavy ML training and inference fit much of the same parallel machinery.

- Thousands of simple cores executing the same instruction on different data (SIMD/SIMT)
- Originally designed for rendering, now critical for [[7aLJOACt|ML]] training and inference.
- Available as [[LxUj37D3|discrete]] add-in cards or [[a2FkPabO|integrated]] units sharing the [[trkh9gwv|SoC]] die with the [[OkJJJyxX|CPU]]

The useful device is larger than its transistor diagram. Drivers, compilers, kernels, libraries and memory systems determine whether an application can reach theoretical throughput. In AI, NVIDIA's advantage has historically included this software ecosystem as well as silicon.

A GPU wins by making one kind of crowd move together. Irregular sequential work still belongs elsewhere.

## Interactions

- [[AiAccel5|AI accelerator]] : : GPUs are one flexible accelerator family among more specialized NPUs, TPUs and ASICs
- [[MemBand6|memory bandwidth]] : : Feeding thousands of arithmetic lanes makes high-bandwidth memory central to real performance
- [[Thr0ugh8|throughput]] : : Wide parallel execution favors aggregate work completed over minimizing every individual operation's latency
