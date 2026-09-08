---
uid: "Ba6mR3kL"
address: "ML//Inference//distributional shift//basin of attraction"
name: "Basin of Attraction"
date: "2026-03-03"
---
Regions of [[RnKMoC3a|latent space]] where certain types of continuations are strongly preferred, and the model "falls into" them based on context.
- [[2oNdlB5L|Pretraining]] created these basins: "after reasoning → coherent conclusion" is one basin, "after question → direct answer" is another, "after nonsense → unpredictable continuation" is another.
- Random text as context doesn't help because it positions the model in a basin with no semantic structure. The model has no signal about what type of continuation to produce.
- Structured reasoning activates a specific basin because during pretraining, that pattern co-occurred systematically with correct conclusions. It's intentional [[Ds3fR7kX|distributional shift]] toward a useful attractor.
- The technical effect: reasoning tokens **reduce entropy** of the output distribution. Fewer plausible tokens survive as continuations, and the ones that remain tend to be more correct.
- [[Ov3tJ8kR|Overthinking]] happens when excessive reasoning tokens push the model past the useful basin into a "complex reasoning" attractor that's counterproductive for simple problems.
- [[Eb4kN7xS|Exposure bias]] is falling into a bad attractor: once errors accumulate, the context vector enters a basin the model never navigated during training.

