---
uid: "Ra2rH4nW"
address: "ML//Training//RLAIF"
name: "RLAIF"
date: "2026-03-07"
---
Reinforcement Learning from AI Feedback: replace the human annotators in [[0f5GJDwc|RLHF]] with an AI model that evaluates responses. The core mechanism behind [[mCK28lZ6|Constitutional AI]]
- How it works: define a set of principles (the "constitution"), then ask the AI to critique its own outputs against those principles. The AI generates preference pairs (better/worse responses), which train a [[83orykQl|reward model]], which trains the policy via [[rxVjxTLA|PPO]] or [[YwfNaR4R|DPO]]
- Why this matters: human annotation is expensive, slow, inconsistent, and doesn't scale. RLAIF can generate millions of preference comparisons at a fraction of the cost. The bottleneck shifts from annotation budget to principle design.
- [[JdOhceqx|Claude]] is trained with Constitutional AI, which is RLAIF in practice. The principles encode Anthropic's safety priorities: helpful, harmless, honest. The AI learns to internalize these values through self-critique rather than memorizing human preferences.
- The trust problem: if the AI is flawed, its feedback is flawed. RLAIF can amplify biases in the critique model. This is mitigated by using stronger models as critics, diverse principles, and human spot-checks.
- Compared to [[0f5GJDwc|RLHF]]: RLAIF scales better and is more consistent, but RLHF captures human values that might not be expressible as principles. In practice, most frontier labs use a hybrid: RLAIF for bulk preferences, RLHF for edge cases.

## Interactions

- [[Sh7kM3nQ|Safe RLHF]] : : Safe RLHF separates helpfulness and harmlessness into two reward models. RLAIF could generate the training data for both, but the architectural separation is orthogonal to the feedback source
