---
uid: "CvXv15xo"
address: "ML//Evaluation//cross-validation"
name: "cross-validation"
date: "2026-07-04"
---
Estimating out-of-sample performance by rotating which fold is held out, then averaging.
- Grouped (session-level) CV: a whole group goes entirely into train or test, never both, to avoid [[DtLk14xn|leakage]] from near-duplicate rows.
- Stratify the folds so rare positives do not all pile into one.
- The effective sample size is the number of independent groups, not the number of rows.
