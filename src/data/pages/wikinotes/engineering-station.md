---
slug: engineering-station
uid: "O59rx1hI"
address: "industrial//industrial automation//engineering station"
name: "engineering station"
date: "2026-09-06"
aliases: ["engineering center", "operator versus engineer"]
---
The place where engineers modify configuration, logic, control loops, databases and graphics of a control system. It is a different function from the operating center, where operators drive the process, even when both sit in the same room.
- An operator sees screens, alarms and histories and changes the setpoints they are authorized to change ([[NgpDKDPB|HMI]], [[0bRULBNr|operating center]]). An operator should not be reprogramming controllers during a normal shift; that is what the engineering station is for.
- In a [[7NrcWZUv|DCS]] the separation is built into the product: engineering stations and operator stations are different roles with different permissions. In a PLC world it is enforced by procedure and by who holds the programming software.
- The same split explains why remote access to OT is treated so carefully: a session that can change logic is not the same risk as one that can only watch.
