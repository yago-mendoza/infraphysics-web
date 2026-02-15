---
uid: "1yDGHLLU"
address: "ML//NPU"
name: "NPU"
date: "2026-02-05"
---
- Dedicated accelerator for [[7aLJOACt|ML]] inference workloads — optimized for matrix multiply-accumulate at low precision (INT8, FP16)
- Found inside modern [[trkh9gwv|SoC]] designs (Apple Neural Engine, Qualcomm Hexagon, Google Tensor)
- Offloads inference from the [[OkJJJyxX|CPU]] and [[WEUTQwqv|GPU]], achieving higher throughput per watt
- Programmable via frameworks like Core ML, NNAPI, or ONNX Runtime
- NPU is passive; awakens the [[gKR2I1Nu|MCU]] only if a pattern is detected
- Used for continuous events (sound) where always-on [[QSPGKDnh|sensor]] filtering isn't enough
---
[[t8sPNl54|TPU]] :: both are [[6YzJQiig|ASIC]]s for matrix (tensor) multiplication (`y = mx + n`); NPU does forward-pass only (inference), TPU also does back-propagation (training) and requires higher precision (not quantized)
