---
uid: 4vDsUzfM
address: "ML//RL//Policy"
name: "Policy"
date: "2026-03-07"
---

A policy maps an observed state to an action, or more generally to a probability distribution over actions:

{math}
\pi(a \mid s)
{/math}

- In reinforcement learning, the policy decides what the agent does; a value function estimates how good a state or action is. They may share one neural network, but they answer different questions.
- A deterministic policy always chooses the same action for a state. A stochastic policy preserves exploration and can represent uncertainty or genuinely mixed strategies.
- The agent rarely observes the full environment state. Its policy usually maps partial observations to actions, so memory and beliefs about hidden state can matter as much as the policy network.

An LLM resembles a policy over tokens: context is the observation and the next token is the action. An embodied agent extends that loop until actions also alter the external environment.
