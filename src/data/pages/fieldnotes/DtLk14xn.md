---
uid: "DtLk14xn"
address: "ML//Evaluation//data leakage"
name: "data leakage"
date: "2026-07-04"
---
When information the model would not have at prediction time sneaks into training, inflating scores that then collapse in the real world.
- Does not need to look like cheating: a clean random split can leak when near-duplicate rows (same session, adjacent time windows) land on both sides.
- The reason to split by group (session, patient, user), not by row. See [[CvXv15xo|cross-validation]].
- A post-hoc feature not available at prediction time is a classic leak.
