---
uid: "W30pa8xC"
address: "Blockchain//Besu//ExtraData"
name: "ExtraData"
date: "2025-05-03"
---
- Clique extraData format: `0x` + 32 bytes vanity (64 zeros) + 20 bytes address (no 0x) + 65 bytes seal (130 zeros)
- The 20-byte middle section is where initial validator addresses are concatenated
- Multiple validators: concatenate their addresses back-to-back in the middle section
- The 65-byte seal at the end is reserved for the block signature — left as zeros in genesis

---
[[UFgfX2Jv|Besu Genesis]] :: extraData is a critical field — wrong format means the chain stalls at block 0

