---
uid: kJfQz2vH
address: "ML//RL//Training//distributed training"
name: "distributed training"
date: "2022-01-20"
---

- Training across multiple [[WEUTQwqv|GPUs]]/nodes
- Data parallelism: same model on every GPU, split the batch. Model parallelism: split the model across GPUs. Pipeline parallelism: split by layer.
- Communication overhead is the bottleneck — NVLink and InfiniBand interconnects matter as much as the GPUs themselves
