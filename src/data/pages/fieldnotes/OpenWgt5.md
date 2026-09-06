---
uid: "OpenWgt5"
address: "ML//open-weight model"
name: "Open-Weight Model"
date: "2026-09-04"
---

An open-weight model makes trained parameter files available under specified license terms. That enables local inference, fine-tuning, quantization, inspection and deployment without sending every request to the original provider.

Open-weight does not automatically mean open source. Training data, training code, architecture details or commercial rights may remain restricted. Nor does weight access remove dependency on accelerator vendors, serving frameworks and upstream model releases.

Possessing the engine gives you important freedom. It does not mean the entire factory came with blueprints.

## Interactions

- [[ClosdM7P|closed model]] : : Closed models expose behavior through a provider-controlled interface rather than distributing the learned weights
- [[MdlCmp8R|model compression]] : : Weight access permits direct quantization, pruning and other deployment-specific transformations
- [[VndLock6|vendor lock-in]] : : Local deployability can reduce API dependency while leaving other layers of lock-in intact
