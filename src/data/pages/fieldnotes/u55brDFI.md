---
uid: "u55brDFI"
address: "Security//Replay Attack"
name: "Replay Attack"
date: "2025-09-07"
---
- Replaying a transaction signed for one chain on another chain with the same chainId
- Chain ID in the signature prevents cross-chain replay: different chains → different signature hashes (EIP-155)
- Even with same chainId: nonce mismatch blocks replay — if the target chain's account nonce is ahead, the old nonce is rejected
- EIP-712 goes further: adds `verifyingContract` address to the signed domain — prevents cross-contract replay on the same chain

---
[[8mybr8ae|Chain ID]] :: chainId was specifically introduced to prevent cross-chain replay attacks

