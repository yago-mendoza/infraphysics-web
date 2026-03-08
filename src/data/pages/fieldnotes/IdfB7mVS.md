---
uid: "IdfB7mVS"
address: "ML//GPT//GPT-3//few-shot learning"
name: "Few-Shot Learning"
date: "2020-10-15"
---
Give the model a few examples in the prompt, and it generalizes to new inputs.
- No gradient update, no [[esHo5jMx|fine-tuning]] — the model "learned to learn" during [[2oNdlB5L|pre-training]]
- Didn't work reliably below ~10B parameters. Scale was the key.
- Mechanistically: works partly because [[Ih8nK5xW|induction heads]] read the examples and copy their patterns to the new input — the [[Hd4nK8xS|attention heads]] that implement pattern-matching are doing the heavy lifting.
- Part of the broader [[oBpGr85I|in-context learning]] phenomenon: the model adapts behavior from context alone.

## Interactions

- [[oBpGr85I|in-context learning]] : : Few-shot is the explicit version of in-context learning — deliberate examples instead of implicit pattern recognition
