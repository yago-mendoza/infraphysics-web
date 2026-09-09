---
slug: vfd
uid: "keWFUA5P"
address: "industrial//industrial automation//VFD"
name: "VFD"
date: "2026-09-06"
aliases: ["variable frequency drive", "variador", "drive", "inverter drive"]
---
A **Variable Frequency Drive** controls the speed and torque of an AC motor by changing the frequency and voltage it feeds. In a machine the chain is sensors, then the [[mfLejTTj|PLC]], then the VFD, then the motor: the PLC decides what should happen, the drive solves the electrical control of the motor.
- A PLC output rarely powers a motor directly. It commands the drive with a setpoint (speed, torque, start, stop), over a fieldbus or industrial Ethernet such as [[dOYR97cR|PROFINET]], and the drive closes its own fast current and speed loops inside.
- Drives are sold by the big automation vendors (ABB, Siemens, Rockwell, Schneider) and are one of the components a [[cb9f4huK|system integrator]] has to make talk to a PLC of another brand.
- Beyond speed, a modern drive is a data source: current, torque, temperature, energy, fault codes, all readable as tags for condition monitoring ([[SApEgyT4|telemetry]]).

## Interactions

- [[2TNcXgxM|actuator]] : : A drive is the industrial actuator that turns a numeric setpoint into shaft speed; the robotics actuator note stops at the motor, the drive is the box between the controller and it
