---
uid: "R00tAc5S"
address: "Security//root access"
name: "Root Access"
date: "2026-09-04"
---

Root access is the highest conventional administrative authority on a Unix-like machine. Root can normally read and modify nearly all files, manage users, control services and alter security-relevant configuration.

It is a local privilege level, not proof of unlimited control over an organization. Network segmentation, separate identities, hardware roots of trust and external control planes may remain outside the host. Even so, root usually lets an attacker destroy evidence, persist and steal every secret available to that machine.

Owning one castle does not mean owning the kingdom, but it does include the keys inside that castle.

## Interactions

- [[LatMov3N|lateral movement]] : : Secrets recovered with root can provide credentials for reaching other machines
