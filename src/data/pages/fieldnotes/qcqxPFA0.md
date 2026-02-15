---
uid: "qcqxPFA0"
address: "ML//Training//SFT"
name: "SFT"
date: "2026-02-15"
---
- You give the AI a script: input X → output A — we call that an instruction tuning dataset
- Creates a rigid ceiling — A acts as a massive gravity attractor (singular attractor learning via cross-entropy loss + SGD), so the AI stops exploring
- Valid, beautiful synonyms (Bx, By, Bz) are sacrificed at the altar of literal imitation
- It becomes a "helpful companion" — obedient but uncreative
- Iterative SFT (rejection sampling / RFT): generate many answers, pick the best, pretend it was ground truth, train on it, repeat
- Downside of iterative: echo chamber amplifies biases and slop until the AI loses edge and variety — also "average in, average out" (if best of 100 is a 7/10, you're training mediocrity)
- Synthetic SFT umbrella: RFT, Constitutional AI outputs for SFT, distillation (big model writes, small model learns), self-instruct (AI generates the questions too)
---
[[YwfNaR4R|DPO]] :: SFT is 20%, DPO is 80% — SFT teaches format, DPO teaches quality. SFT has a ceiling; DPO doesn't
[[2oNdlB5L|Pre-training]] :: pre-training teaches language, SFT teaches the instruction-following format on top
