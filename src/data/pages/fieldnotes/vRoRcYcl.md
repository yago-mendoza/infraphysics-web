---
uid: "vRoRcYcl"
address: "ML//neural network//dropout"
name: "Dropout"
date: "2018-01-05"
---
- During training, randomly masks activations with probability \(p\) and rescales the survivors. At inference the full network is used without random masks.
- The noise discourages fragile co-adaptation: a feature cannot assume that every collaborating feature will always be present.
- It can be interpreted loosely as averaging many subnetworks that share weights, although it is not identical to training an explicit ensemble.

Dropout was crucial in early deep networks. In many modern architectures, abundant data, normalization, augmentation, and weight decay reduce how much it helps; regularization is workload-dependent, not ceremonial.
