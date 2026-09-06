---
uid: "Sandb0x1"
address: "Security//sandbox"
name: "Sandbox"
date: "2026-09-04"
---

A sandbox is an execution environment that deliberately restricts what code can reach or change. Useful boundaries include filesystem paths, processes, network destinations, devices, credentials, system calls and resource consumption.

Isolation is not a decorative container label. A sandbox that mounts production secrets or permits unrestricted outbound traffic may isolate one dimension while leaving the consequential ones open. The design question is always: if the workload becomes adversarial, what remains unreachable?

A good sandbox does not promise that code will behave. It makes misbehavior boring and bounded.

## Interactions

- [[SbxEsc4P|sandbox escape]] : : An escape defeats an enforced isolation boundary rather than merely using access that was already granted
- [[NetEgr5S|network egress]] : : Outbound connectivity is a separate sandbox capability that should be scoped explicitly

