---
title: "Claim to check: 96% of Claude and GPT-5 weights are useless"
status: "unverified"
language: "en"
added: "2026-09-13"
source: "https://x.com/_yusufknl/status/2098724555963425208/video/1?s=48"
tags: ["llm", "neural-network", "scaling", "training", "inference", "compute"]
---

Text supplied by the author, preserved as a source claim, not adopted as fact:

> As someone who ships LLM systems in production, this scaling video is the closest thing to a "why 96% of Claude and GPT-5's weights are literally useless" explainer I've ever seen released for free.
>
> Everyone thinks trillion-parameter models need every parameter. They don't. A 2019 pruning experiment proved you can delete 96% of a neural net's weights with zero performance loss - meaning most of Claude and GPT-5 is empty scaffolding around a tiny "winning lottery ticket" network doing all the real work.
>
> Bookmark this 18-min video and watch tonight. Same lottery ticket math from 2019 MIT research, now the reason every AI lab wastes 90%+ of its Nvidia budget.

Verification, 2026-09-13: the [original lottery-ticket paper](https://arxiv.org/abs/1803.03635) studies fully connected and convolutional networks on MNIST/CIFAR10. Its hypothesis concerns subnetworks that train effectively with suitable initial weights. It does not establish a 96% removable fraction for Claude or GPT-5, zero loss across their capabilities, or a corresponding GPU-budget saving. The exact experiment behind the video's 96% figure remains to be located.

[SparseGPT](https://arxiv.org/abs/2301.00774) reports 50–60% unstructured sparsity on OPT-175B/BLOOM-176B with small accuracy changes. That is useful LLM-specific evidence, with different models, sparsity and evaluation conditions. It does not verify this post's extrapolation.

Related [Bits2Bricks idea and essential explanatory link](../articles/bits2bricks/lottery-tickets-and-lighter-llms.md).
