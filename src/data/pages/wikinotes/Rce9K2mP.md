---
uid: "Rce9K2mP"
address: "Security//remote code execution"
name: "Remote Code Execution"
date: "2026-09-04"
---

Remote code execution (RCE) allows an attacker to make a target system execute attacker-controlled code across a network boundary. It is an impact class, not one particular bug.

RCE is severe because code execution can become the first foothold in a longer chain. The initial process may still be sandboxed or low privilege, so consequences depend on accessible secrets, network position and available escalation paths. “Code ran” and “the machine is fully controlled” are not synonyms.

The first shell is often the beginning of the incident, not the end.

## Interactions

- [[PrvEsc6L|privilege escalation]] : : An attacker may escalate after RCE when the compromised process starts with limited authority
- [[LatMov3N|lateral movement]] : : Network position and credentials obtained after execution can open paths to other systems

