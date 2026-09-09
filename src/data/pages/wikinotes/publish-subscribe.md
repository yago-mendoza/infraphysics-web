---
slug: publish-subscribe
uid: "I87NKxE8"
address: "networks//network theory//publish-subscribe"
name: "publish-subscribe"
date: "2026-09-06"
aliases: ["pub/sub", "decoupling", "message bus"]
---
A communication pattern where producers publish messages to a named channel and consumers subscribe to the channels they care about. An intermediary, the broker, receives every publication and distributes it, so producers and consumers never need to know each other.
- Without it, A knows B: every application opens its own connection to every data source, and adding a consumer means touching the producers. With it, A knows the broker and B knows the broker. Adding a new consumer is a new subscription, nothing else changes. That decoupling is why the pattern scales to many readers of the same data.
- [[9y91dC7S|MQTT]] is the lightweight protocol that made the pattern standard in IoT; a [[giue07uO|CAN bus]] is a hardware-level cousin, where every node sees every frame and picks the identifiers it wants, though CAN is not MQTT.
- The pattern distributes information; it does not read or write a device. Request-response protocols such as Modbus do that, and the two are layered rather than exchanged ([[JS0lHIsn|MQTT]]).

## Interactions

- [[Ev3pNx7L|Event-driven API]] : : The event-driven API note fires an event so processing leaves the request; publish-subscribe generalizes that: the event has many subscribers, none of them known to the publisher, and the broker keeps them apart
- [[WlyXzixc|REST]] : : REST is request-response with the client naming the resource; pub/sub inverts it, the producer names a topic and whoever cares listens. One asks, the other announces
