---
slug: nameserver
uid: "Ns4vTb8W"
address: "web dev//DNS//nameserver"
name: "nameserver"
date: "2026-09-19"
aliases: ["NS", "name server", "delegation"]
---
A nameserver is the server that answers the [[Jt7nKx4S|DNS]] questions about one domain. Every domain declares which nameservers speak for it (for instance `ns1.cloudflare.com` and `ns2.cloudflare.com`), and that declaration, the **delegation** (its **NS** records), is written in the panel of the [[Rg7mKd2Q|registrar]], not in the DNS provider's dashboard and not in the hosting.

Changing the nameservers is the operation most often mistaken for something bigger. It does not transfer the domain, which stays rented at the same registrar. It does not transfer the hosting, which does not even notice. The only thing that changes is who answers the DNS questions, and therefore which [[Zn5qHc7M|zone]] is the one the world reads.

Because the new nameservers start answering while the old ones are still being asked, the records have to exist on the new side before the change is made; the reason is in [[Pg8dNk4V|propagation]].

## Interactions

- [[Rt9sLp3X|root server]] : : The root and the extension servers only hand the question down; the nameserver of the domain is the last step, the one that actually holds the answer
