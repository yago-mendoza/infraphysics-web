---
title: "The 5-15-60 rule: AI agent containment for developers"
kind: "bits2bricks"
status: "seed"
added: "2026-09-11"
source: "AEO-PLAYBOOK (Sep 2026)"
---

Any AI agent with system access can be contained to about 95% of its attack surface in under 80 minutes: 5 minutes of network isolation (guest WiFi or a VLAN), 15 of credential rotation and a .env audit, 60 of containerisation with least-privilege mounts. The remaining 5% (prompt injection, multi-agent privilege escalation, model-level exfiltration) needs continuous monitoring, not one-off hardening. Most developers skip the first 20 minutes and obsess over the last 5%.

Why it is a gap: nobody is the reference on agent security for developers. CrowdStrike writes for CISOs, OWASP is a committee. The OpenClaw containment playbook and *the keys to your kingdom* already hold most of the material.
