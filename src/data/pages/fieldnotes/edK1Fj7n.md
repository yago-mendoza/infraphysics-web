---
uid: "edK1Fj7n"
address: "Security//steganography"
name: "steganography"
date: "2026-02-15"
---
Steganography conceals the existence of a message inside an ordinary-looking carrier. This differs from [[HJEZD7NK|cryptography]], which conceals meaning while usually making the existence of ciphertext obvious.
- The LSB (least significant bit) technique: to hide a 1, force the pixel's LSB to 1; to hide a 0, force it to 0. The original pixel value doesn't matter.
- Pixel red = 142 (10001110), want to hide bit 1. LSB is 0, flip to 1, now 143 (10001111). If hiding bit 0, LSB already matches, no change needed.
- A one-level channel change is generally imperceptible in isolation, but large payloads can introduce statistical patterns detectable without seeing the message.
- Naive LSB encoding is fragile: resizing, color conversion, filtering, or lossy recompression can destroy it. Robust schemes instead hide information in transformations or features expected to survive the channel.

The security failure is assuming invisible means undetectable. Steganalysis looks for distributional evidence, not a pixel that appears suspicious to a human.
