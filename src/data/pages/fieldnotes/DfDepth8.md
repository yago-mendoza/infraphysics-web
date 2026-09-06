---
uid: "DfDepth8"
address: "Security//defense in depth"
name: "Defense in Depth"
date: "2026-09-04"
---

Defense in depth combines independent or partially independent controls so that one failure does not directly become catastrophe. Identity policy, sandboxing, network restrictions, monitoring, approvals, backups and incident response cover different failure modes.

The word “independent” does the real work. Five controls that all trust the same compromised credential are one control drawn five times. Layers should fail differently and leave evidence for the next layer to notice.

Security is rarely a perfect wall. It is a sequence of inconvenient rooms with alarms between them.

## Interactions

- [[Sandb0x1|sandbox]] : : Sandboxing limits execution while other layers govern identity, network reach and recovery
- [[BehDet9N|behavioral detection]] : : Detection provides a compensating layer when prevention fails or an action was technically authorized

