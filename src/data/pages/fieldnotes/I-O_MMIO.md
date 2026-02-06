---
address: "I/O//MMIO"
date: "2026-02-05"
---
Memory-mapped I/O — hardware registers mapped into the [[CPU]]'s address space so they look like ordinary [[RAM]] locations. A write to address 0x4000_1000 might toggle a GPIO pin; a read from 0x4001_0004 might fetch an ADC sample. [[chip//MCU]] programming is largely MMIO: [[peripheral//STM32]] and [[peripheral//ESP32]] SDKs provide register-level abstractions over MMIO addresses.
[[CPU]]
[[RAM]]
[[chip//MCU]]
[[peripheral//STM32]]
