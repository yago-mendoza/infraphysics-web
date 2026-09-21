---
slug: dns
uid: "Jt7nKx4S"
address: "web dev//DNS"
name: "DNS"
date: "2026-03-10"
aliases: ["Domain Name System"]
---
The **Domain Name System** is the phonebook of the internet: it translates a human-readable [[Pv3wHm8R|domain]] name (`3clabs.io`) into the IP address (`104.18.x.x`) of the machine that answers for it. Nothing on the web is reached by name directly; every visit starts with this lookup.

It is a distributed, hierarchical system, and no single server holds the whole book. The [[Rt9sLp3X|root servers]] know who runs each extension (`.io`, `.com`), the servers of the extension know which [[Ns4vTb8W|nameservers]] speak for each domain, and those nameservers, run by whichever [[Pv6cDn2Y|provider]] manages the DNS of the domain, hold the actual answers.

- The answers are records kept in the [[Zn5qHc7M|zone]] of the domain. **A** maps a name to an IPv4 address and **AAAA** to an IPv6 one; **CNAME** makes a name an alias of another name, which is allowed on a subdomain and not on the [[Ax2wJf6R|apex]]; MX and TXT carry the mail configuration, covered in [[Em3xRt9B|email records]].
- Changes are not instant. Each answer is cached for the time its TTL allows, so a change takes from minutes to 48 hours to reach everyone, and during that window old and new answers coexist ([[Pg8dNk4V|propagation]]).
- [[Hp5nVw9C|Cloudflare]] is one of the largest DNS providers, and the one where a name gets attached to a site as a [[Cd6yMw2S|custom domain]].
