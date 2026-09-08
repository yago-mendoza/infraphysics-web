---
uid: "1gCBEfat"
address: "Security//Minimum Privilege"
name: "Minimum Privilege"
date: "2025-09-07"
---

Minimum privilege gives each identity, process or agent only the authority required for its present role, for only as long as that authority is needed. It is stronger than asking software not to use permissions it already possesses.

The design reduces both attack surface and blast radius. An agent that needs three read-only files should not inherit a general shell, production credentials and unrestricted Internet access. In a Besu network, the same principle separates public RPC nodes from validators and bootnodes instead of exposing every role through one machine.

Permissions are not convenience settings. They are the physical upper bound on what a mistake can become.

## Interactions

- [[6Upy5jpc|Node Roles]] : : Role separation is the practical implementation of minimum privilege in a Besu network
