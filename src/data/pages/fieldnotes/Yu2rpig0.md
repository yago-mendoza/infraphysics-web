---
uid: "Yu2rpig0"
address: "I/O//MMIO"
name: "MMIO"
date: "2026-02-05"
---
- Memory-mapped I/O — hardware registers mapped into the [[OkJJJyxX|CPU]]'s address space so they look like ordinary [[jBm8Zuu2|RAM]] locations
- A write to 0x4000_1000 might toggle a GPIO pin; a read from 0x4001_0004 might fetch an ADC sample
- [[gKR2I1Nu|MCU]] programming is largely MMIO
- [[LR9wgzYo|STM32]] and [[xVyHlNQa|ESP32]] SDKs provide register-level abstractions over MMIO addresses
