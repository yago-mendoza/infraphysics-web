---
slug: mqtt-broker
uid: "dDjuFJ6w"
address: "networks//network protocols//MQTT//MQTT broker"
name: "MQTT broker"
date: "2026-09-06"
aliases: ["message broker", "hosted broker", "on-premise broker"]
---
The intermediary of [[9y91dC7S|MQTT]]: it receives every publication and forwards it to the clients subscribed to the matching topic. It is the component that makes producers and consumers independent of each other ([[I87NKxE8|publish-subscribe]]).
- Deployment options coexist: a broker on premises next to the plant, a hosted broker in the cloud, a hybrid with bridges between them, and redundant brokers for availability. A drawing of several servers behind one name is that redundancy.
- In a factory the broker is the fan-out point: a PLC gateway publishes once, and SCADA, MES, a historian, analytics and the cloud each subscribe ([[JS0lHIsn|MQTT]]). Store-and-forward on the publishing side and persistent sessions on the broker cover the moments the link is down.

## Interactions

- [[OnPrem7S|On-Premises Infrastructure]] : : The on-prem note is about owning the server; a broker is the case where owning it is a data-sovereignty choice: whoever runs the broker sees every message of the plant, so "hosted or on premises" is a question about who holds the data, not about cost
