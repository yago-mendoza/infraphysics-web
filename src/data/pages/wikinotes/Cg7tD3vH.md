---
uid: "Cg7tD3vH"
address: "ML//diffusion model//CFG"
name: "CFG"
date: "2026-03-05"
aliases: ["classifier-free guidance"]
---
Classifier-Free Guidance: a technique that dramatically improves how well [[sr0JBXRW|diffusion models]] follow text prompts, by amplifying the difference between conditioned and unconditioned generation.
- How it works: at each denoising step, run the model twice. Once with the text prompt (conditioned), once without (unconditioned). Then extrapolate away from the unconditioned output toward the conditioned output: output = unconditioned + scale * (conditioned - unconditioned)
- The guidance scale controls the trade-off: scale=1 means normal generation (ignore the unconditioned), scale=7-15 means "follow the prompt more strongly at the cost of diversity." Too high and images become oversaturated and artifacted.
- "Classifier-free" because an earlier method (classifier guidance) used a separate classifier network to steer generation. CFG eliminated that dependency: the model itself provides both predictions during training by randomly dropping the conditioning (text) a fraction of the time.
- Ubiquitous in [[WeLIuxyC|text-to-image]]: [[ZY388cmd|Stable Diffusion]], [[oZeWLvGF|DALL-E]] 2/3, [[v5wwjCcZ|Imagen]], [[IoT0wPoc|Flux]] all use CFG. It's the reason these models can produce images that tightly match complex text descriptions instead of vague approximations.
- The computational cost: two forward passes per denoising step instead of one (or a single batched pass with double the batch size). This is why diffusion generation is slow. But the quality improvement is so large that nobody skips it.

