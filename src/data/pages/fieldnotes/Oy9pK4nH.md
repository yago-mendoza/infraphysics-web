---
uid: "Oy9pK4nH"
address: "ML//reasoning model//o3"
name: "o3"
date: "2026-03-05"
---
OpenAI's second-generation [[Kp4jIz9L|reasoning model]] (December 2024) — scales [[Et5mN8wJ|extended thinking]] further than [[Oy7kR3mL|o1]]
- Configurable compute budgets: low/medium/high thinking time. More thinking = better accuracy = higher cost.
- Likely uses [[Ts5nR2mH|tree search]]: not just linear thinking but active exploration among multiple reasoning branches — evaluate and select the best path. This explains both the accuracy leap and the high cost.
- Branch evaluation options: [[Pr7mK4nX|PRM]] (score each step), self-evaluation (RLAIF), voting (N answers, pick most frequent), external verification (math/code)
- Achieved unprecedented scores on [[O9JoB79C|ARC-AGI]] — the benchmark designed to resist memorization and test genuine reasoning.
- [[nUKlfmSO|DeepSeek]] R1 matched o1-level with open weights and [[HRgl17gQ|GRPO]] — but o3 pushed beyond, suggesting tree search or PRMs add value over group-relative scoring.

## Interactions

- [[Oy7kR3mL|o1]] : : The scaled successor — adds tree search beyond o1's linear thinking, configurable compute budgets
- [[Kp4jIz9L|reasoning model]] : : Pushed the frontier — configurable thinking budgets make the cost-accuracy tradeoff explicit
- [[Ts5nR2mH|tree search]] : : Likely implements tree search — explore N reasoning branches, evaluate with PRMs, select the most valid path
