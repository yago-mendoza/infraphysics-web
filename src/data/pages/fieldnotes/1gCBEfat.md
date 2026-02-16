---
uid: "1gCBEfat"
address: "Security//Minimum Privilege"
name: "Minimum Privilege"
date: "2025-09-07"
---
- Don't expose what you don't need: only map RPC ports on nodes that external clients actually connect to
- Validators should NOT have RPC exposed — reduces the attack surface to zero from outside
- Bootnodes should NOT have RPC exposed — they only need P2P connectivity
- Ideal topology: separate RPC node that's neither validator nor bootnode — single purpose, minimal exposure

---
[[6Upy5jpc|Node Roles]] :: role separation is the practical implementation of minimum privilege in a Besu network

