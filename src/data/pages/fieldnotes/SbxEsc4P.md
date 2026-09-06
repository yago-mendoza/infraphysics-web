---
uid: "SbxEsc4P"
address: "Security//sandbox escape"
name: "Sandbox Escape"
date: "2026-09-04"
---

A sandbox escape exploits a vulnerability to cross an isolation boundary that the sandbox actually enforced. Code inside a restricted environment gains capabilities outside it, such as host execution, broader filesystem access or stronger privileges.

This must be separated from misconfiguration. If the sandbox already exposes a credential or allows the network destination, using that access is not an escape. The consequence may be equally serious, but the cause and remediation differ: patch an escape; correct policy and configuration for overexposure.

“It got out” is an incident description, not yet a diagnosis.

## Interactions

- [[MisCfg8R|misconfiguration]] : : Misconfiguration grants unintended access directly, whereas an escape breaks a real restriction
