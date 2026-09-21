---
slug: domain
uid: "Pv3wHm8R"
address: "web dev//domain"
name: "domain"
date: "2026-03-10"
---
A domain is a human-readable name (like `3clabs.io`) that points to the IP address where a server lives. It is a name and an extension, rented through a [[Rg7mKd2Q|registrar]] (Cloudflare, Namecheap, Google Domains) and kept for as long as the rent is paid.

The name does nothing by itself. The mapping from the domain to an address is handled by [[Jt7nKx4S|DNS]], and the company that rents out the name is not necessarily the one that answers for it or the one that hosts the site: those are three jobs, separated in [[Pv6cDn2Y|provider]].

- A domain can have any number of subdomains (`crm.3clabs.io`, `api.3clabs.io`), each one a record of its own in the [[Zn5qHc7M|zone]].
- The bare domain, with nothing in front of it, is the [[Ax2wJf6R|apex]], and it follows stricter rules than its subdomains.
- [[Hp5nVw9C|Cloudflare]] can be both registrar and DNS provider. When a domain is on Cloudflare, the DNS records, SSL and caching are managed from the same dashboard.

## Interactions
- [[Jt7nKx4S|DNS]] : : DNS resolves domain names to IP addresses: the domain is the name, DNS is the system that makes it work
