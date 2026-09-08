---
uid: "Ds3fR7kX"
address: "ML//Inference//distributional shift"
name: "Distributional Shift"
date: "2026-03-08"
---
The probability distribution over next tokens **changes** depending on what's already in the [[JUby2DIy|context window]]: different context = different [[Ba6mR3kL|basin of attraction]] in probability space.
- During [[2oNdlB5L|pretraining]], the model saw two kinds of text: direct answers and reasoned-then-concluded text. These form **distinct regions** in [[RnKMoC3a|latent space]]
- After reasoning tokens, the model enters the basin where pretraining data had coherent conclusions following explicit thought. After no reasoning, it's in the "cold answer" basin, less reliable.
- Random text as context doesn't help: it positions the model in a region with no semantic structure. Structured reasoning activates a specific basin because that pattern co-occurred systematically with correct conclusions during pretraining.
- The technical effect: reasoning tokens **reduce entropy** of the output distribution. Fewer plausible continuations, and the remaining ones tend to be more correct.
- This is why [[Et5mN8wJ|extended thinking]] works mechanistically: intentional distributional shift toward a useful [[Ba6mR3kL|basin of attraction]]
- In [[0f5GJDwc|RLHF]]/RLAIF: models learned that humans rate reasoned responses higher. The thinking reproduces that high-evaluation structure even when hidden.

## Interactions

- [[oBpGr85I|in-context learning]] : : In-context learning and distributional shift are two faces of the same phenomenon: context changes what the model predicts
