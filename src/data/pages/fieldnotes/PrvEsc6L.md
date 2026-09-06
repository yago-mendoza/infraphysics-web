---
uid: "PrvEsc6L"
address: "Security//privilege escalation"
name: "Privilege Escalation"
date: "2026-09-04"
---

Privilege escalation moves an attacker or process from limited authority to a more powerful security context. It may be vertical (ordinary user to administrator) or horizontal (one user's access to another user's resources).

Initial compromise and final control should be reported separately. A service account with no secrets and a read-only filesystem creates a very different incident from root on a production host. Escalation succeeds when another weakness bridges that gap.

The first breached boundary determines entry. The next one often determines impact.

## Interactions

- [[R00tAc5S|root access]] : : Root is a common endpoint of vertical privilege escalation on Unix-like systems
