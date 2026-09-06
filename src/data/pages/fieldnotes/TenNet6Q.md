---
uid: "TenNet6Q"
address: "Math//tensor network"
name: "Tensor Network"
date: "2026-09-04"
---

A tensor network represents a high-dimensional tensor as a graph of smaller tensors whose connected indices are contracted. The factorization can expose structure that would be impossibly expensive to store in one dense array.

Originally prominent in many-body physics, tensor networks also provide tools for compressing layers and approximating large computations. Their usefulness depends on whether the target tensor has a compact low-rank structure. A beautiful factorization with the wrong rank simply moves the cost into contraction.

Think of it as replacing one enormous table with a small network of reusable relationships.

## Interactions

- [[QntInsp4|quantum-inspired algorithms]] : : Many quantum-inspired classical methods borrow tensor-network machinery developed for representing quantum states
- [[MdlCmp8R|model compression]] : : Tensor factorization can replace dense model weights with a smaller structured representation

