---
slug: mqtt-topic
uid: "aCxOsap9"
address: "networks//network protocols//MQTT//MQTT topic"
name: "MQTT topic"
date: "2026-09-06"
aliases: ["topic hierarchy", "topic = route"]
---
The named channel of an [[9y91dC7S|MQTT]] message, written as a slash-separated path: a topic is a route.

{bkqt/note|A topic}
factory/madrid/line3/pump7/vibration
{/bkqt}

- Consumers subscribe to exactly what they need, with wildcards for a level or a subtree: one client wants every vibration signal of line 3, another wants everything from pump 7. The hierarchy is the addressing scheme of the whole data layer, which is why naming it well matters as much as naming database tables.
- A disciplined plant-wide topic tree is the seed of the unified namespace idea: one hierarchy where every system publishes and reads by the same names ([[3xSClPzE|data contextualization]]).
