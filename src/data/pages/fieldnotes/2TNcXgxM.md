---
uid: "2TNcXgxM"
address: "Robotics//actuator"
name: "actuator"
date: "2026-02-15"
---

An actuator converts a control signal into physical work: torque, displacement, pressure, heat, light, or flow. It is the outward half of a [[8dk62Xwk|robot]]; a [[QSPGKDnh|sensor]] measures the world, while the actuator changes it.

- Motors, solenoids, hydraulic cylinders, valves, and heaters are all actuators. The useful classification is usually by energy domain and failure mode, not by shape.
- The command is not the motion. Backlash, saturation, dead zones, friction, and latency sit between requested and actual output. This is why open-loop demos look easy and reliable control does not.
- An actuator plus a sensor closes the loop. Without feedback, software is issuing wishes to physics.

[[38QY7o3A|Control]] : : Actuator limits and dynamics determine what a controller can physically achieve
