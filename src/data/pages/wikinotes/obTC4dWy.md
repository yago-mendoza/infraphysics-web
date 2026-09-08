---
uid: "obTC4dWy"
address: "ML//neural network//overfitting"
name: "Overfitting"
date: "2018-03-08"
---
Overfitting occurs when a model captures patterns specific to its training sample that do not generalize to the target distribution. Memorization can contribute, but memorization and generalization are not strict opposites in large models.

- A widening train–validation gap is evidence, not a direct meter: leakage, distribution mismatch, label noise, and an unrepresentative validation set can produce similar symptoms.
- More representative data, [[tMlQ2MGK|regularization]], augmentation, early stopping, and appropriate capacity can help. “Simpler” is useful only relative to the evidence available.
- The real test is not performance on data the model has not seen; it is performance on data drawn from the conditions where the model will actually be used.
