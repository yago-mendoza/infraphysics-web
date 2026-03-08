---
uid: "Mc4xR8wP"
address: "ML//Training//dataset//model collapse"
name: "Model Collapse"
date: "2026-03-08"
---
An ouroboros in gradient space: train on your own outputs, and each generation forgets a little more of what made the original interesting. The [[Td5yK2jL|tail distribution]] erodes first, then the whole distribution narrows.
- Generation 1: model produces plausible but slightly averaged outputs. Generation 2: trains on generation 1, loses more variance. Generation N: converges to a bland, mode-seeking average.
- The tails are the first casualty — rare events, unusual phrasings, minority perspectives, edge cases. The model forgets what it never saw enough of.
- **Especially dangerous for reasoning**: the most sophisticated reasoning chains live in the [[Td5yK2jL|tail]] of the pretraining distribution. Once lost, no amount of RL or [[Et5mN8wJ|extended thinking]] recovers them — [[2oNdlB5L|pretraining]] is the ceiling.
- Different from [[bKPquVKV|mode collapse]] in GANs: mode collapse is the generator ignoring modes during training. Model collapse is the training DATA losing modes across generations.
- The uncomfortable implication: as AI-generated content floods the internet, future models trained on web data inherit compounding distortions.

## Interactions

- [[avBp6NIF|synthetic data]] : : Synthetic data is the fuel, model collapse is the exhaust — recursive self-training erodes the distribution that made the original model good
- [[EFKsfm4D|dataset]] : : Data curation becomes existential — you need verified human-generated data in the mix to anchor the distribution against collapse
