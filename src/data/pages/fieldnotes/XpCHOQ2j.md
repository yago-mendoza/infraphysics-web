---
uid: "XpCHOQ2j"
address: "ML//prompt injection"
name: "prompt injection"
date: "2026-02-26"
---
- Attack where adversarial text in the input overrides the system prompt or instructions
- Direct: user writes "ignore previous instructions" in their query
- Indirect: malicious instructions hidden in retrieved documents, web pages, emails — the model follows them
- Unsolved problem. Defenses (input filtering, output guards) reduce risk but no reliable fix exists
---
[[EEUGaAWQ|jailbreak]] :: different attack surfaces — jailbreaks target the model's alignment training, prompt injection targets the application's context and instructions
