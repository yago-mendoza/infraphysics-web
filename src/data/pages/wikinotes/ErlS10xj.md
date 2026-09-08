---
uid: "ErlS10xj"
address: "ML//Training//early stopping"
name: "early stopping"
date: "2026-07-04"
---
Regularization by stopping training when validation performance stops improving, rather than when training loss bottoms out.
- Training loss keeps falling while validation loss bottoms out early and then drifts up; the gap is [[obTC4dWy|overfitting]]. Stop at the validation minimum.
- Requires a held-out fold that model selection never trains on. Under grouped data, the stopping fold must respect the same [[CvXv15xo|cross-validation]] split.
- Cheap and effective for [[rK1Dy2Fa|LSTM]] and [[GbTr08xh|gradient boosting]] alike.
