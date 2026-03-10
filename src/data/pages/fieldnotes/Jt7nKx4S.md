---
uid: "Jt7nKx4S"
address: "Web Dev//DNS"
name: "DNS"
date: "2026-03-10"
---
Domain Name System -- the internet's phonebook. Translates human-readable [[Pv3wHm8R|domain]] names (`3clabs.io`) into IP addresses (`104.18.x.x`).
- Distributed, hierarchical system: root servers --> TLD servers (`.io`, `.com`) --> authoritative servers (your provider)
- Key record types: A (domain --> IPv4), AAAA (domain --> IPv6), CNAME (alias --> another domain), MX (mail), TXT (verification, SPF)
- Propagation (TTL): changes take minutes to 48 hours to spread globally
- [[Hp5nVw9C|Cloudflare]] is one of the largest DNS providers
