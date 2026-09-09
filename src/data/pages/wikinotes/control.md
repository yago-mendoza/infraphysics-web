---
slug: control
uid: "38QY7o3A"
address: "control"
name: "control"
date: "2026-09-01"
---
Control is the engineering of behavior over time: measure a system, compare it with a desired state, and choose inputs that keep the error bounded despite disturbances and imperfect models.

- Feedback buys robustness by reacting to reality instead of trusting the model. It also creates the possibility of oscillation and instability.
- A controller cannot repair missing authority. Sensor delay, actuator saturation, noise, and plant dynamics set physical limits before tuning begins.
- The plant, the controller and the closed loop are separated in [[5zL83qyU|feedback control]]; which modes inputs can reach and sensors can see is [[u0TgVFYF|controllability and observability]]; [[EsNQLPTq|vertical drone]] runs both on one axis.
- PID is popular because proportional, accumulated, and anticipatory error cover a remarkable amount of industry with little computation. State-space methods expose more structure when variables interact strongly.

[[rttI47hN|Systems theory]] : : Control asks how feedback changes the dynamics of an interconnected system
[[8dk62Xwk|Robotics]] : : Robots close control loops through sensors, computation, and actuators
