---
uid: "Eb4kN7xS"
address: "ML//Training//exposure bias"
name: "Exposure Bias"
date: "2026-03-02"
---
A student who only ever practiced with answer keys, then had to take the exam using its own messy drafts as reference. During [[qcqxPFA0|SFT]], the model always sees **correct** context (human-written training data). At inference, it sees its own previous outputs, which may contain errors.
- The model was never trained on its own mistakes as context. When it generates a wrong token, that error becomes context for the next token, pushing toward more errors, a distribution the model never saw during training.
- Path dependency in the [[Rs6cD4vX|residual stream]]: once the model starts generating in a wrong direction, each incorrect token shifts the context vector further from familiar territory. It's an attractor, hard to escape.
- This is why [[Et5mN8wJ|extended thinking]] has a dark side: more generated tokens = more opportunities for an error to compound into a cascade via path dependency.
- Related to [[Ov3tJ8kR|overthinking]]: longer reasoning chains give exposure bias more room to accumulate.
- Mitigation approaches: scheduled sampling (mix model outputs into training), [[0f5GJDwc|RLHF]]/[[YwfNaR4R|DPO]] (train on model-generated outputs with reward signal), and [[Ts5nR2mH|tree search]] (explore multiple branches to escape bad paths)

