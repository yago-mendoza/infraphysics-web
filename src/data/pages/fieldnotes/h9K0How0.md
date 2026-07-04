---
uid: "h9K0How0"
address: "Systems Theory//cybernetics"
name: "Cybernetics"
date: "2026-03-06"
---
The science of control and communication in systems, founded by Norbert Wiener (1948), same year as Shannon's information theory.
- Core concept: the feedback loop. A system acts, observes the result, and adjusts its next action. Negative feedback stabilizes (thermostats, PID controllers, KL divergence in RL). Positive feedback amplifies (compounding errors, reward hacking, viral growth)
- [[JdSKWaAz|Ashby's Law]] is the first law of cybernetics: a controller must match the variety of its environment.

##### ML as feedback systems

- [[qcqxPFA0|SFT]], [[YwfNaR4R|DPO]]: open-loop (no feedback during training: fixed dataset, no model output in the loop)
- [[NYb6zLJ5|RL]] ([[rxVjxTLA|PPO]], [[HRgl17gQ|GRPO]]): closed-loop (the model generates, gets feedback, adapts, a textbook cybernetic system)
- [[Rh9tN6hF|Reward hacking]]: positive feedback gone wrong. The model exploits the reward signal, amplifying degenerate behaviors.
- KL divergence as negative feedback: prevents the RL policy from diverging too far from the reference model, a stabilizing constraint, like a governor on a steam engine.
- Second-order cybernetics: systems that observe themselves observing. [[mCK28lZ6|Constitutional AI]] is an example: the model critiques its own outputs using principles, then trains on the critique. The observer is part of the system.

## Interactions

- [[rttI47hN|Systems Theory]] : : Cybernetics is the control-focused branch of systems theory, Wiener's framework for understanding feedback, regulation, and communication in machines and organisms
- [[JdSKWaAz|Ashby's Law]] : : Ashby's Law is the foundational theorem of cybernetics, the absolute constraint on any controller's effectiveness
