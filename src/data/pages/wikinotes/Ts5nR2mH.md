---
uid: "Ts5nR2mH"
address: "ML//Inference//extended thinking//tree search"
name: "Tree Search"
date: "2026-03-06"
---
Beyond linear thinking: explore multiple reasoning branches, evaluate them, choose the best.
- Linear thinking: token1 → token2 → token3 → answer. One path, no backtracking.
- Tree search: generate N branches → evaluate each → select the best → continue from there. Like a human "considering several options".
- [[Oy9pK4nH|o3]] likely uses this: not just more thinking tokens but active search among multiple reasoning chains. This is why o3 is expensive: exploring branches multiplies compute.
- Evaluation of branches can use: [[Pr7mK4nX|PRM]] (score each step), self-evaluation (RLAIF), voting (generate N answers, pick most frequent), or external verification (for math/code)
- Self-consistency bias problem: the model tends to prefer branches consistent with its own [[2oNdlB5L|pretraining]] biases, not necessarily the most correct ones. It's judging its own work with its own blind spots.
- [[tigM1SSY|Tree of Thought]] was the prompt-engineering precursor. Tree search in [[Kp4jIz9L|reasoning models]] is the trained, scaled, RL-optimized version.

## Interactions

- [[tigM1SSY|Tree of Thought]] : : Tree of Thought was the idea (branching reasoning at prompt level), tree search in reasoning models is the implementation (trained with RL, integrated into inference)
- [[Oy9pK4nH|o3]] : : Likely uses tree search: the step beyond linear thinking that explains both its accuracy leap and its high cost
- [[Pr7mK4nX|PRM]] : : PRMs are the natural evaluator for tree search: score each branch step-by-step to choose the most valid reasoning path
