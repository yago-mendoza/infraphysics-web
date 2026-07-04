---
uid: "VeirkpAh"
address: "ML//model//GPT//nanoGPT"
name: "nanoGPT"
date: "2026-03-08"
---
Andrej Karpathy's minimal [[2oNdlB5L|pre-training]] codebase for reproducing [[SfCOccLg|GPT-2]] from scratch. ~600 lines of core training code, a research instrument, not a product.
- nanoGPT (2023) → nanochat (2025): added fp8 mixed precision, better data loading, fused kernels.
- Trains GPT-2 (d12, 124M params) on a single 8×H100 node in ~2 hours. The speed enables rapid ablation: 8–12 experiments per day.
- Dataset quality dominates: NVIDIA ClimbMix beat FineWeb-edu, DCLM, and OLMo data out of the box. Raises [[Bk7UXmQT|Goodhart's curse]] concerns. Is ClimbMix optimized for the benchmarks?
- Karpathy tested AI agents (Claude Code, Codex) as automated researchers iterating on nanochat. Result: agents implement well-scoped ideas perfectly but can't design experiments: no ablation discipline, no baseline control, spurious findings (e.g. "discovered" that bigger networks have lower loss without controlling for FLOPs).

## Interactions

- [[SfCOccLg|GPT-2]] : : nanoGPT's target architecture. GPT-2 (124M) is the standard capability benchmark for pretraining optimization research
- [[2oNdlB5L|pre-training]] : : nanoGPT is the reference implementation for understanding the pretraining loop: dataset → forward pass → loss → backprop → repeat
- [[Bk7UXmQT|Goodhart's curse]] : : Dataset selection for pretraining has the same Goodhart risk as reward model training. If the dataset is curated to score well on benchmarks, the model may not be genuinely better
