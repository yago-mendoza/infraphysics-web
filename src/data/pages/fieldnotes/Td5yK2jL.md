---
uid: "Td5yK2jL"
address: "ML//Training//dataset//tail distribution"
name: "Tail Distribution"
date: "2026-03-01"
---
The rare events at the edges of a probability distribution: the 0.1% cases that standard training underweights.
- In language: unusual phrasings, rare factual combinations, edge-case reasoning chains. In safety: jailbreaks, adversarial inputs, novel failure modes.
- Why they matter: robustness lives in the tails. A model that handles the average case perfectly but fails on tails is fragile, and failures in tails are often the most consequential.
- [[Mc4xR8wP|Model collapse]] erodes tails first because they have the weakest signal: the model "forgets" what it barely learned.
- [[Rh9tN6hF|Reward hacking]] exploits tail blindness: if the [[83orykQl|RM]] hasn't seen a particular adversarial pattern, the model can optimize toward it without penalty.
- Data augmentation and targeted collection of rare cases are the main defenses, but you can't augment what you don't know exists.

## Interactions

- [[Mc4xR8wP|model collapse]] : : Model collapse kills tails first: each recursive generation smooths out the long tail of rare events
- [[EFKsfm4D|dataset]] : : Dataset quality is disproportionately about tail coverage: the common cases are easy, the rare cases define the ceiling
