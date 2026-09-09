---
slug: mqtt
uid: "9y91dC7S"
address: "networks//network protocols//MQTT"
name: "MQTT"
date: "2026-09-06"
aliases: ["Message Queuing Telemetry Transport"]
---
A lightweight [[I87NKxE8|publish-subscribe]] protocol over [[d0JwXdPu|TCP/IP]], built for telemetry and events. A producer publishes to a topic on a [[dDjuFJ6w|broker]]; any number of clients subscribe to that [[aCxOsap9|topic]] and receive the message. The producer never needs to know who consumes.
- Born for constrained devices and unreliable links, which is why it fits IoT and the industrial edge: small headers, keep-alive, quality-of-service levels for delivery guarantees, retained messages and last-will announcements when a client drops.
- What it is for and what it is not: MQTT distributes information between systems; it does not read or write a device's registers, and it was not designed to move a robot axis. In a plant it sits on the IT side of the boundary, fed by a gateway that speaks the fieldbuses ([[JS0lHIsn|MQTT]]).
- Compared with raw TCP sockets, UDP or SSH tunnels, the point of MQTT is decoupling: A and B both know the broker and nothing about each other.

## Interactions

- [[WlyXzixc|REST]] : : REST pulls a resource on demand and returns a status code; MQTT pushes a value the moment it changes to everyone subscribed. Polling a PLC over REST and subscribing to its tags over MQTT are opposite traffic shapes for the same data
