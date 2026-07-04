---
uid: "ClIm16xp"
address: "ML//Evaluation//class imbalance"
name: "class imbalance"
date: "2026-07-04"
---
When one class massively outnumbers the other, so a model can score well by mostly ignoring the rare class.
- Breaks accuracy and [[RcAu12xl|ROC-AUC]]; use [[PrAu11xk|PR-AUC]] and base-rate behavior instead.
- Even a good model concentrates but does not purify: most alarms stay false because most cases are non-events.
- Handled at training time with class-weighted [[q3MjogvW|cross-entropy]], focal loss, or resampling.
