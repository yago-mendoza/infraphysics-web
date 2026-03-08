---
uid: "Oy7kR3mL"
address: "ML//model//GPT//o1"
name: "o1"
date: "2026-03-05"
---
OpenAI's first frontier [[Kp4jIz9L|reasoning model]] (September 2024) — the model that proved [[Et5mN8wJ|extended thinking]] scales.
- Uses RL on [[ct4swTMy|chain of thought]]: trained to generate high-quality reasoning chains. Reward signal = is the final answer correct? Likely uses [[Pr7mK4nX|PRMs]] (score each reasoning step, not just the outcome)
- Core insight: more test-time compute = better answers. Instead of making the model bigger, let it **think longer**.
- The thinking is hidden from the user — the model generates internal reasoning tokens that are discarded before showing the response.
- Dominated math, coding, and science benchmarks — outperformed GPT-4 on [[xJDUBSRn|GPQA]], [[MiRujlYa|MATH]], and competition-level problems.
- [[Ov3tJ8kR|Overthinking]] weakness: empirically worse than GPT-4 on simple common-sense questions — extended thinking on trivial problems triggers a [[Ds3fR7kX|distributional shift]] to the wrong [[Ba6mR3kL|basin]]
- OpenAI didn't publish full technical details. But [[nUKlfmSO|DeepSeek]] R1 published its pipeline (SFT + [[HRgl17gQ|GRPO]]) and matched o1 — suggesting the approach isn't magic.

## Interactions

- [[Oy9pK4nH|o3]] : : Scales further — likely adds [[Ts5nR2mH|tree search]] (multiple branches) beyond o1's linear thinking
- [[Kp4jIz9L|reasoning model]] : : Proved the paradigm — test-time compute trades off against model size, and reasoning can be trained with RL
- [[Et5mN8wJ|extended thinking]] : : Extended thinking productized — RL-trained reasoning chains as a first-class inference capability
