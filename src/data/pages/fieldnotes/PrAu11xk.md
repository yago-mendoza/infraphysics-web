---
uid: "PrAu11xk"
address: "ML//Evaluation//PR-AUC"
name: "PR-AUC"
date: "2026-07-04"
---
Area under the precision-recall curve. The evaluation metric that actually respects rare positives.
- Unlike [[RcAu12xl|ROC-AUC]], it is sensitive to [[ClIm16xp|class imbalance]]: on a rare-event problem a high ROC-AUC can hide a useless precision.
- The baseline equals the positive rate, not 0.5, so "PR-AUC 0.1" can still be real signal when positives are 1% of the data.
- Use it whenever the positive class is scarce and false alarms are costly.
