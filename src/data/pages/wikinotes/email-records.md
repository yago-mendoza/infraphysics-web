---
slug: email-records
uid: "Em3xRt9B"
address: "web dev//DNS//email records"
name: "email records"
date: "2026-09-19"
aliases: ["MX", "SPF", "DKIM", "MX record"]
---
The mail of a domain is configured entirely in its [[Zn5qHc7M|zone]], through three kinds of record that answer three different questions. They are easy to ignore while building a website and they are the first thing that breaks when the DNS is touched carelessly.

- **MX** says which servers the mail for the domain is delivered to. It is the receiving side.
- **SPF** says who is authorised to send mail in the name of the domain. It is a TXT record listing the permitted senders.
- **DKIM** is a signature that proves a message is authentic, checked against a key published in the zone.

SPF and DKIM decide whether outgoing mail lands in the inbox or in spam: a domain that sends without them is filtered as a matter of course. [[Hp5nVw9C|Cloudflare]]'s Email Routing covers only the receiving half, since it receives and forwards and does not send outgoing mail.

## Interactions

- [[Sm5tWc9D|site migration]] : : Mail is the first casualty of a migration because its records sit in the same zone as the website's and nobody working on the website is looking at them
