---
slug: site-migration
uid: "Sm5tWc9D"
address: "web dev//deploy//site migration"
name: "site migration"
date: "2026-09-19"
aliases: ["hosting migration"]
---
A site migration replaces the site behind a domain with one hosted somewhere else. When the [[Jt7nKx4S|DNS]] of the domain is already under the control of whoever migrates, it needs no access to the old platform and none to the [[Rg7mKd2Q|registrar]]: changing the records in the [[Zn5qHc7M|zone]] is enough, and the old site builder never has to be opened.

What breaks when it is done in a hurry is everything in the zone that was not the website.

- Mail goes first. Its [[Em3xRt9B|email records]] sit next to the ones being edited.
- Subdomains nobody mentioned come next: a booking engine, cameras, a payment terminal. They cannot be guessed from outside, so the existing records are reviewed one by one before anything is replaced.
- The domain itself may be registered through the site builder. Then the builder is the registrar, and the domain has to be taken out of it first.

When the migration also changes the nameservers, the order of operations is the one in [[Pg8dNk4V|propagation]].

## Interactions

- [[Pv6cDn2Y|provider]] : : A migration is only hard when the three jobs were bought as one product; the work is finding out which of them the old company actually holds
