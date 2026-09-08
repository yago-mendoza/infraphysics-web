---
uid: "XpCHOQ2j"
address: "ML//prompt injection"
name: "Prompt Injection"
date: "2026-02-27"
---
- Attack where adversarial text in the input overrides the system prompt or instructions.
- Direct: user writes "ignore previous instructions" in their query.
- Indirect: malicious instructions hidden in retrieved documents, web pages, emails. The model follows them.
- Unsolved problem. Defenses (input filtering, output guards) reduce risk but no reliable fix exists.

## Interactions

- [[EEUGaAWQ|jailbreak]] : : Different attack surfaces: jailbreaks target the model's alignment training, prompt injection targets the application's context and instructions
