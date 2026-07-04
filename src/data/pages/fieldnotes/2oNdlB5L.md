---
uid: "2oNdlB5L"
address: "ML//Training//Pre-training"
name: "Pre-training"
date: "2026-02-15"
---
Imagine a baby alien staring at the static of the universe. It stares at billions of sentences until it realizes "the pilot has turned on the..." is followed by "seatbelt sign" and not "karaoke machine".
- Pure next-token prediction at massive scale: no human feedback, no instructions.
- **Pretraining is the ceiling**: [[qcqxPFA0|SFT]] and [[YwfNaR4R|DPO]]/RL don't create new capabilities: they navigate toward useful regions of the distribution already learned here. If the pretraining data lacks high-quality reasoning, no amount of RL recovers it. Models small + much RL < models large + little RL.
- This makes [[Mc4xR8wP|model collapse]] especially dangerous: the sophisticated reasoning that lives in the [[Td5yK2jL|tail distribution]] is the first thing erased by recursive synthetic training, and once gone from pretraining, [[Et5mN8wJ|extended thinking]] can't reach those regions.
- Continued pre-training: like sending a toddler who just learned to speak to medical school, then dumping a mountain of niche books on its head.
- GPT-2 was pure pre-training (no fine-tuning). OpenAI wanted to see if volume alone was enough.
- GPT-3 was the same but massive. It predicted text beautifully but didn't follow instructions.

## Interactions

- [[U7ljk7Wf]] : : The GPT family tracks how pre-training scaled from GPT-1's modest corpus to GPT-3's internet-scale data
- [[qcqxPFA0]] : : Pre-training gives the model language; SFT gives it obedience
