---
uid: edK1Fj7n
address: cybersecurity//steganography
name: steganography
date: 2026-02-15
---
- Hiding data inside innocent-looking media by manipulating bits the human eye can't distinguish
- The LSB (least significant bit) technique: to hide a 1, force the pixel's LSB to 1; to hide a 0, force it to 0. The original pixel value doesn't matter
- Pixel red = 142 (10001110), want to hide bit 1. LSB is 0, flip to 1, now 143 (10001111). If hiding bit 0, LSB already matches, no change needed
- The change is invisible: 142 vs 143 is a color difference no human can perceive
- Fragile: steganography is destroyed by screenshots (pixel resampling) or image recompression (lossy codecs like JPEG rewrite the bit values)