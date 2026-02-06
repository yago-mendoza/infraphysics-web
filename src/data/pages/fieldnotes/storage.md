---
address: "storage"
date: "2026-02-06"
---
Persistent retention of data beyond power cycles. Ranges from embedded flash on [[chip//MCU]] platforms to enterprise SAN arrays. The two dominant technologies are magnetic platters (HDD) and NAND flash (SSD). A [[storage//cache]] layer absorbs hot reads and coalesces writes before they hit the slower medium. The OS abstracts raw blocks into file systems, and [[I/O//DMA]] moves bulk data without burdening the [[CPU]].
[[storage//cache]]
