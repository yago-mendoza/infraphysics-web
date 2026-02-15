---
uid: "sNxMwfUX"
address: "manufacturing//firmware"
name: "firmware"
date: "2026-02-05"
---
- Software permanently stored in a device's non-volatile memory (flash, EEPROM) — the first code that runs at power-on
- For a [[gKR2I1Nu|MCU]], initializes clocks, configures [[PrATEjcr|peripheral]] registers via [[Yu2rpig0|MMIO]], and enters the main application loop
- Written in C/C++, compiled to ARM/RISC-V machine code
- Flashed onto the device via SWD, JTAG, or USB bootloader
- Over-the-air (OTA) updates allow field upgrades
- Assembly steps: (1) C/Assembly for firmware, (2) basic electronics to power circuitry ([[nlro5GOJ|capacitor]]s), (3) KiCad for [[26t2rDup|PCB]] layout
