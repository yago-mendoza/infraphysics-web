---
uid: "Firew4lL"
address: "Networks//firewall"
name: "Firewall"
date: "2026-09-04"
---

A firewall permits or blocks network traffic according to rules about source, destination, protocol, port and sometimes application-layer content. It controls reachability. It does not decide whether every permitted action is benign.

That limitation is not obsolescence. Preventing a workload from contacting most of the network remains one of the cheapest ways to shrink attack surface and blast radius. Behavioral monitoring answers a different question after or during allowed communication.

The firewall is still the door. It simply cannot recognize every dangerous guest.

## Interactions

- [[NetEgr5S|network egress]] : : Egress firewall rules determine which outbound destinations a workload can reach
- [[Xdr8C0rR|XDR]] : : XDR correlates behavior across domains while the firewall enforces network reachability rules

