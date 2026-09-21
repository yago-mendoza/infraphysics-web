---
slug: root-server
uid: "Rt9sLp3X"
address: "web dev//DNS//root server"
name: "root server"
date: "2026-09-19"
aliases: ["TLD server"]
---
The root servers are thirteen groups of servers that know a single thing: who is in charge of each extension. They know nothing about any particular domain. Asked about `www.example.it`, the root only answers *for .it, ask the servers of .it*.

Resolution is a walk down that hierarchy, read from right to left in the name. The root says who controls `.it`. The servers of `.it` say who controls `example.it`, which means naming its [[Ns4vTb8W|nameservers]]. Those nameservers finally say which address `www` has. Each step sends the question to the next one, and the root is only the first step.

The root servers are authoritative, but only for the root: the one list they hold is which servers speak for each extension. The servers of an extension (the **TLD servers**) are authoritative for that extension in the same narrow sense, since they hold which nameservers speak for each domain under it and nothing about what is inside those domains. That second list is the one a [[Rg7mKd2Q|registrar]] writes into: when the nameservers of a domain are entered in its panel, the registrar loads them into the registry of the extension. Nobody writes to the root or to the extension directly.
