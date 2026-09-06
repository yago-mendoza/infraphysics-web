---
uid: "NetEgr5S"
address: "Networks//network egress"
name: "Network Egress"
date: "2026-09-04"
---

Network egress is traffic leaving a machine, workload or trust zone. Egress policy controls which destinations, protocols and ports that workload may reach.

For an agent sandbox, inbound isolation is only half the boundary. Unrestricted outbound access can enable data exfiltration, arbitrary downloads, command-and-control traffic or contact with external services. A useful policy often begins with no network and adds narrowly scoped destinations as the task demonstrates need.

“No public port” does not mean “no path to the Internet”. Direction matters.

## Interactions

- [[1gCBEfat|minimum privilege]] : : Network reachability is a capability and should be granted with the same restraint as filesystem access
