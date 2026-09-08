---
uid: "BehDet9N"
address: "Security//behavioral detection"
name: "Behavioral Detection"
date: "2026-09-04"
---

Behavioral detection asks whether a process, identity or sequence of actions behaves suspiciously rather than whether a file exactly matches a known malicious artifact.

This makes it useful against novel and generated attacks, but also makes calibration difficult. Administrators, automation and AI agents routinely perform unusual actions for legitimate reasons. Strong detection therefore combines context, sequence, baselines and consequence instead of treating “rare” as a synonym for “hostile”.

Novelty is evidence. It is not a verdict.

## Interactions

- [[SigAv7rS|signature-based antivirus]] : : Signatures recognize known artifacts; behavior can recognize familiar attack patterns expressed through new artifacts
