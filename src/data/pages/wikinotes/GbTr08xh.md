---
uid: "GbTr08xh"
address: "ML//gradient boosting"
name: "gradient boosting"
date: "2026-07-04"
---
Ensemble that builds many shallow decision trees in sequence, each correcting the residual errors of the ones before it.
- Dominant on tabular data: exploits nonlinear interactions between features without learning a representation from scratch.
- Often the real rival to an [[rK1Dy2Fa|LSTM]] on small or medium tabular time-series problems, and frequently wins there.
- Implementations: XGBoost, LightGBM, CatBoost. Prone to [[obTC4dWy|overfitting]] without regularization and [[ErlS10xj|early stopping]].
