---
uid: "RcAu12xl"
address: "ML//Evaluation//ROC-AUC"
name: "ROC-AUC"
date: "2026-07-04"
---
Area under the ROC curve: the probability the model ranks a random positive above a random negative.
- 0.5 is a coin, 1.0 is a perfect oracle. Reads cleanly and is threshold-independent.
- Deceptive under [[ClIm16xp|class imbalance]]: rewards ranking even when almost every alarm is a false positive. Pair it with [[PrAu11xk|PR-AUC]].
- A model can be directionally right (ROC 0.72) and operationally useless at the same time.
