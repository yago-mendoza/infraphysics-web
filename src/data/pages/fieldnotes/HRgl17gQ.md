---
uid: HRgl17gQ
address: "ML//Training//GRPO"
name: "GRPO"
date: "2026-03-03"
---

Group Relative Policy Optimization — [[nUKlfmSO|DeepSeek]]'s alternative to [[rxVjxTLA|PPO]] for RL fine-tuning.
- Score multiple completions relative to each other within a group, no separate [[83orykQl|RM]] needed.
- Simpler, more stable, and cheaper than PPO. Used to train DeepSeek R1's [[Kp4jIz9L|reasoning]] capabilities.
- Part of the "RL without process reward models" approach that challenged OpenAI's PRM methods.

## Interactions

- [[rxVjxTLA]] : : GRPO is the simpler alternative — replaces the learned value function with group-relative scoring, cutting the need for a separate reward model
