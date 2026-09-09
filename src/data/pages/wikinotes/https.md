---
slug: https
uid: "g9jb8QD1"
address: "networks//network protocols//HTTPS"
name: "HTTPS"
date: "2026-09-06"
aliases: ["HTTP over TLS", "HTTP"]
---
HTTP carried over TLS, normally over [[d0JwXdPu|TCP/IP]]: the request-response protocol of the web, encrypted. It is the transport of REST APIs and of most IT integration ([[WlyXzixc|REST]]).
- It stacks like everything else: HTTPS over TCP/IP over [[aHC0Nhas|Ethernet]] over fiber in an office, or over 4G at a remote site ([[uWeRvnh7|protocol stack]]).
- In a plant it is welcome above the control layer, between applications and toward the cloud, and the wrong tool below it: request-response with no cyclic update, no data quality, no timestamps and an HTTP 500 that cannot say "the transmitter lost power 3.8 seconds ago" ([[N3kQDfIx|fault semantics]]).
