---
title: "Lottery tickets and lighter LLMs: what pruning actually saves"
status: "seed"
language: "en"
added: "2026-09-13"
source: "https://x.com/0xEronn/status/2097194596363129231"
tags: ["llm", "neural-network", "training", "inference", "compute", "explainer"]
---

Author's idea: include, wherever it fits, the possibility of making LLMs roughly 95% lighter. Save this as a Bits2Bricks idea, with the explanatory link below kept prominently.

**KEEP: [0xEronn's explanation](https://x.com/0xEronn/status/2097194596363129231).** The linked X article is [LLMs Explained From Zero. From a 1966 Chatbot to Grok 4.5 and Kimi K3](https://x.com/i/article/2097054721030643712). Its title and article text were retrieved through FxTwitter on 2026-09-13; its wider historical and model claims have not been fact-checked.

[The scaling video shared by _yusufknl](https://x.com/_yusufknl/status/2098724555963425208/video/1?s=48) supplied the 96% claim. The video itself has not been watched or transcribed. Preserve the supplied wording and its verification status in [the claim record](../../facts/llm-96-percent-pruning-claim.md).

Possible practical angle, proposed during capture: reproduce pruning on a small open model and measure quality, nonzero weights, checkpoint bytes, peak memory and latency separately. Compare dense execution with a sparse implementation; include the cost of finding the sparse network. The percentage is a question to test, not a promised outcome or a statement about Claude/GPT-5.

Primary reading: [Frankle and Carbin, The Lottery Ticket Hypothesis (ICLR 2019)](https://arxiv.org/abs/1803.03635), and [SparseGPT](https://arxiv.org/abs/2301.00774) for later work on language models. Keep training from a suitable initialization distinct from deleting weights in an already deployed model. Future use fits explanations of overparameterization, pruning and inference efficiency; do not insert the 95–96% assertion into published articles as an established general result.
