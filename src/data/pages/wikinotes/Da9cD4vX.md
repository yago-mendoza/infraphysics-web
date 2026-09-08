---
uid: "Da9cD4vX"
address: "ML//Training//dataset//data augmentation"
name: "Data Augmentation"
date: "2026-02-25"
---
Creating new training examples by transforming existing ones: flip an image, add noise, paraphrase text, mask tokens. The goal is to expand the effective dataset size without collecting new data.
- The primary defense against [[obTC4dWy|overfitting]] when you can't get more data. By showing the model different views of the same example, you force it to learn invariances (a cat is still a cat when flipped) instead of memorizing specific pixel patterns.
- In vision: random cropping, rotation, color jitter, cutout (mask random patches). These are standard for [[G1JW8o79|CNN]] training. [[A9DuyXJ2|Convolution]]'s translation equivariance handles some invariances architecturally, but augmentation covers the rest.
- In NLP: back-translation (translate to another language and back), synonym replacement, random insertion/deletion. Less natural than vision augmentation because small text changes can alter meaning.
- [[1zpNyBrj|Masked language modeling]] ([[MwbJnjdN|BERT]]) is arguably a form of augmentation: by randomly masking tokens, each training pass sees a different "view" of the same sentence. The model must reconstruct the original from partial information.
- Distinct from [[avBp6NIF|synthetic data]]: augmentation transforms real examples (preserving ground truth), synthetic data generates entirely new examples (from a model or procedural rules). Augmentation is safer because the transformations are meaning-preserving by design, while synthetic data can introduce [[Mc4xR8wP|model collapse]] if the generation model has systematic biases.

