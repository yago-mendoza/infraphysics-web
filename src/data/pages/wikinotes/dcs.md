---
slug: dcs
uid: "7NrcWZUv"
address: "industrial//industrial automation//DCS"
name: "DCS"
date: "2026-09-06"
aliases: ["distributed control system", "DeltaV"]
---
A **Distributed Control System** controls large industrial processes with many controllers spread over the plant instead of a single one. Typical traits: high availability, redundancy, integrated engineering, alarm management, PID control, a historian, operator stations, and a very large number of signals.
- The tempting summary, "a hundred redundant PLCs connected, plus alarms", is a good first intuition and a misleading definition. A DCS is not bought as a hundred [[mfLejTTj|PLCs]] wired together. Its controllers, networks, engineering stations, operator stations, alarms, history, redundancy and configuration management are designed from the start to work as **one control system** with the rest of the plant. The integration is the product.
- Classic platforms: Emerson DeltaV, Honeywell Experion, Yokogawa CENTUM, ABB System 800xA, Siemens PCS 7 and PCS neo. DeltaV is not "a big PLC": from one engineering environment you configure controllers, PID loops, alarms, graphics, historization, redundancy, communications and stations.
- Its natural terrain is [[fYkOo9I6|process automation]]: keep pressure at 5 bar, level at 65 %, temperature at 180 degrees and flow at 200 t/h while the variables interact, which means tens, hundreds or thousands of control loops managed together.
- Operation and engineering are separated on purpose: the [[O59rx1hI|engineering station]] changes logic and configuration, the operating center drives the process ([[NgpDKDPB|HMI]]).

## Interactions

- [[mfLejTTj|PLC]] : : A PLC is a controller you integrate; a DCS is an integration you buy. Many PLCs plus a SCADA can imitate a DCS, but redundancy, alarm philosophy, change management and diagnostics then become the integrator's problem instead of the product's
- [[5zL83qyU|feedback control]] : : The loops the control note designs one at a time exist in a DCS by the thousand, each a PID block with its own alarms, limits and history; the platform's job is running all of them together without an engineer per loop
