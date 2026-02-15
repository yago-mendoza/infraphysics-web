---
uid: "QB8hS8Ts"
address: "storage"
name: "storage"
date: "2026-02-06"
---
- Persistent retention of data beyond power cycles
- Ranges from embedded flash on [[gKR2I1Nu|MCU]] platforms to enterprise SAN arrays
- Two dominant technologies: magnetic platters (HDD) and NAND flash (SSD)
- A [[Xgibd7Nl|cache]] layer absorbs hot reads and coalesces writes before they hit the slower medium
- The OS abstracts raw blocks into file systems, and [[2p1K1HEC|DMA]] moves bulk data without burdening the [[OkJJJyxX|CPU]]
