---
uid: "mCK28lZ6"
address: "ML//Training//constitutional AI"
name: "constitutional AI"
date: "2026-02-15"
---
- Expert writes a constitution (rules) — the AI self-improves against it
- Process: AI[X] produces Bx → AI[X + rules] produces reflection (R) on Bx → AI[X + R] produces By (By > Bx)
- The AI doesn't choose between Bx and By (that's [[0f5GJDwc|iterative DPO]]) — it CRAFTS By through reasoning
- The By > Bx pairs feed [[YwfNaR4R|DPO]] directly — far wiser than training a [[83orykQl|reward model]] for [[rxVjxTLA|PPO]]
- Sometimes the reasoning output is reused for [[qcqxPFA0|SFT]] — contains nice structures and core ideas
---
[[YwfNaR4R|DPO]] :: Constitutional AI generates the contrastive pairs that feed iterative DPO — the fastest training pipeline today
[[Bk7UXmQT|Goodhart's curse]] :: the gap between "what we wrote" in the constitution and "what we meant" is where catastrophic misalignment lives
[[0f5GJDwc|RLHF]] :: Constitutional AI (RLAIF) replaces human annotators — trades human judgment for speed and scale
