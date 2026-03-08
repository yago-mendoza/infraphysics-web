---
uid: "Kp4jIz9L"
address: "ML//reasoning model"
name: "Reasoning Model"
date: "2026-02-25"
---
Models trained to "think" before answering via [[Et5mN8wJ|extended thinking]] — generate intermediate reasoning tokens, then produce the final answer from a richer [[JUby2DIy|context]]
- [[Oy7kR3mL|o1]] (OpenAI, Sep 2024): first frontier reasoning model. Uses RL on CoT, likely with process reward models.
- [[Oy9pK4nH|o3]] (OpenAI, Dec 2024): scaled further, configurable compute budgets, unprecedented [[O9JoB79C|ARC-AGI]] scores.
- R1 ([[nUKlfmSO|DeepSeek]], Jan 2025): open-weight, matched o1 via [[HRgl17gQ|GRPO]] — no [[qcqxPFA0|SFT]] needed, proved the approach isn't proprietary.
- The paradigm dominates 2025. Core insight: more test-time compute = better answers. Trade model size for thinking time.
- Mechanistically: [[Ds3fR7kX|distributional shift]] — reasoning tokens position the model in the [[RnKMoC3a|latent space]] region where pretraining associated explicit thought with correct conclusions.

## Interactions

- [[ct4swTMy|chain of thought]] : : Reasoning models formalize and scale CoT — from a prompting trick to a trained capability with dedicated compute budgets
- [[Et5mN8wJ|extended thinking]] : : Extended thinking is the mechanism, reasoning models are the products — RL-trained systems that generate optimal thinking chains
