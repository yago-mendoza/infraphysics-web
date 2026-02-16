---
uid: "NYb6zLJ5"
address: "ML//reinforcement learning"
name: "reinforcement learning"
date: "2018-06-15"
---
- Agent learns by trial and error, maximizing cumulative reward
- No labeled data — just actions, states, and outcomes
- Q-learning: learn the value of each action in each state. Policy gradient: directly optimize the action probabilities.
- Connected to language models through [[0f5GJDwc|RLHF]] — RL trains the reward model, reward model trains the LLM
---
[[83orykQl|reward model]] :: RLHF brought RL into language model training — the reward model is a learned proxy for human preferences
