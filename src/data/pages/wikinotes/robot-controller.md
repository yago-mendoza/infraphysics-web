---
slug: robot-controller
uid: "hgytSVXF"
address: "industrial//industrial automation//robot controller"
name: "robot controller"
date: "2026-09-06"
aliases: ["KUKA controller", "robot cell"]
---
An industrial robot (KUKA, ABB, FANUC) comes with its own controller. The plant [[mfLejTTj|PLC]] does not command every joint motor current; it sends the robot controller high-level orders such as "start program 17", "part available", "safe zone", "cycle complete", and the controller resolves kinematics, servos, interpolation, trajectories, safety and coordinated motion inside.
- From the PLC's point of view the robot is a sophisticated black box. The smarter the subsystem, the less the PLC needs to know about its internals: more complex, more flexible.
- The controller is polyglot on purpose: it integrates through several industrial interfaces and protocols (PROFINET, EtherNet/IP, fieldbus I/O, safety buses), so it can sit in a Siemens cell or a Rockwell cell ([[1pkzK8nT|industrial Ethernet]]).
- Coordinating the robot's axes with each other and with external axes is a [[fnuKFZ2c|motion control]] problem, not a Ladder problem.

## Interactions

- [[8dk62Xwk|Robotics]] : : The robotics notes look inside the robot; from the factory floor the robot is a peer controller that the PLC hands orders to, and the integration question is which protocol the two speak, not how the arm is built
- [[mfLejTTj|PLC]] : : The PLC owns the cell sequence, the robot controller owns the motion; neither can do the other's job well, and the handshake between them (start, done, fault, safe) is where integrators spend their time
