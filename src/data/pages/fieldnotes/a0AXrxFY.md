---
uid: "a0AXrxFY"
address: "ML//Red teaming"
name: "Red teaming"
date: "2026-02-15"
---
- Stress tests on LLM behavior — hire people (or AIs) to break your model on purpose
- Findings become fuel for training: [[qcqxPFA0|SFT]] (quick patch), [[mCK28lZ6|Constitutional AI]] → [[YwfNaR4R|DPO]] (deep fix — now you can generate more pairs for more extensive DPO), system prompt guardrails (bandaid)
- An arms race with no finish line — every patch creates new edges, every new capability creates new attack surfaces
- Benchmarks: exams on LLM intelligence, usually scored
- Safety training: like benchmarks but for the 500 known danger categories instead of intelligence
- Guardrails: pure system prompt injection, no training — faster than SFT/DPO but most brittle
- Few-shot learning: no training at all, weights stay frozen — shove examples into the prompt to narrow down the [[RnKMoC3a|latent space]]
---
[[3EKErev3|Alignment]] :: red-teaming is empirical alignment — finding the failures that theoretical frameworks miss
[[YwfNaR4R|DPO]] :: red-teaming discoveries feed the contrastive pairs for deeper DPO training cycles
