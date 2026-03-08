---
uid: "0f5GJDwc"
address: "ML//Training//RLHF"
name: "RLHF"
date: "2026-02-15"
---
Humans choosing between Bx and By — generated using different [[5qpyTXdv|temperatures]] or strategies.
- The preference pairs (By > Bx) feed either [[YwfNaR4R|DPO]] directly or a [[83orykQl|RM]] for [[rxVjxTLA|PPO]]
- Data format is algorithm-agnostic: same (prompt, chosen, rejected) triplets serve any preference-based method — [[YwfNaR4R|DPO]], [[rxVjxTLA|PPO]], [[HRgl17gQ|GRPO]]
- InstructGPT (GPT-3.5) was the inflection point — took GPT-3 and added [[qcqxPFA0|SFT]] + RLHF, creating the first "assistant".
- The feedback loop works while humans can still judge which output is better.
- [[Sh7kM3nQ|Safe RLHF]] splits the annotation: separate human scores for helpfulness and harmlessness, separate [[83orykQl|RMs]], controllable tradeoff.

## Interactions

- [[3EKErev3]] : : RLHF breaks down when humans can't judge the output — the scalable oversight problem
- [[mCK28lZ6]] : : RLAIF replaces human judges with AI judges — faster, cheaper, scales better, but depends on constitution quality
- [[Op3pJ7mS|on-policy vs off-policy]] : : The same RLHF preference data can be consumed on-policy (PPO generates + scores) or off-policy (DPO trains on fixed pairs)
