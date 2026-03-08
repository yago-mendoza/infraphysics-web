---
uid: "Pr7mK4nX"
address: "ML//Training//reward model//PRM"
name: "PRM"
date: "2026-03-08"
aliases: ["process reward model"]
---
Process Reward Model — scores each **intermediate step** of reasoning, not just the final answer.
- Contrast with ORM (Outcome Reward Model): ORM asks "is the final answer correct?", PRM asks "is each step valid?"
- PRM can detect [[Rh9tN6hF|reward hacking]] of the thinking itself — a model might write plausible-sounding reasoning that accidentally or adversarially arrives at the correct answer by the wrong path.
- Probably part of [[Oy9pK4nH|o3]]: the most sophisticated approach to evaluating reasoning chains, scoring per-step instead of per-outcome.
- OpenAI's approach vs DeepSeek's: OpenAI likely uses PRMs for [[Oy7kR3mL|o1]]/o3, DeepSeek R1 used [[HRgl17gQ|GRPO]] (group-relative scoring without a separate RM) — challenged the PRM approach and got comparable results.
- The PRM vs ORM tradeoff: PRM is more expensive (need step-level annotations) but catches more failure modes. ORM is cheaper but can't distinguish lucky guesses from valid reasoning.

## Interactions

- [[83orykQl|RM]] : : PRM is a specialized reward model — evaluates process (each reasoning step) instead of just outcome (final answer)
