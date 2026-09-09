---
slug: edge-ai
uid: "sfCH7K8e"
address: "industrial//industrial data layer//edge gateway//edge AI"
name: "edge AI"
date: "2026-09-06"
aliases: ["industrial AI at the edge", "edge inference", "camera plus PLC"]
---
Running analysis or machine-learning models directly on the [[iJg3vN8L|industrial PC]] or gateway next to the machine, instead of streaming every raw sample or image to the cloud.
- The typical combination is a camera plus the PLC feeding one edge node. The PLC contributes structured signals (speed 32, part present, recipe B17); the camera contributes an image; the edge synchronizes them: when the PLC says the part is ready, run the vision model on this frame. Control data and computer vision meet there.
- The economics: a camera at 30 images per second produces terabytes of video; local inference sends "defect detected, confidence 98.7 %" instead. Capture, infer locally, transmit only the result or the anomaly.
- Same advantages as any edge computing, sharpened by the plant: lower latency, less bandwidth, independence from the cloud, privacy, robustness ([[Tm6yRs2K|edge computing]]). And the same caveat as every model in production: the data feeding it is only as good as the contextualization behind it ([[3xSClPzE|data contextualization]]).

## Interactions

- [[5hSqc1Yd|camera]] : : The robotics camera note treats the camera as a sensor of the robot; on the factory edge the camera is a second data source that the PLC's event timeline gives meaning to. The frame is worth nothing without the "part ready" signal that says which frame to look at
