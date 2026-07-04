---
uid: "LgtR07xg"
address: "ML//logistic regression"
name: "logistic regression"
date: "2026-07-04"
---
Linear classifier: a weighted sum of features passed through a [[SgmD02xb|sigmoid]] to output a probability. Trained by minimizing [[q3MjogvW|cross-entropy]].
- Readable: the coefficients say how each feature pushes the odds, easy to sanity-check against domain knowledge.
- The default scientific control before any deep model. If a small logistic model over hand-built features matches the network, the problem was mostly linear.
- Cannot capture feature interactions on its own; that is where [[GbTr08xh|gradient boosting]] or a neural net can pull ahead.
