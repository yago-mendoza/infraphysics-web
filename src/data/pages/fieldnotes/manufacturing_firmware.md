---
address: "manufacturing//firmware"
date: "2026-02-05"
---
The software permanently stored in a device's non-volatile memory (flash, EEPROM) — the first code that runs at power-on. For a [[chip//MCU]], firmware initializes clocks, configures [[peripheral]] registers via [[I/O//MMIO]], and enters the main application loop. Written in C/C++, compiled to ARM/RISC-V machine code, and flashed onto the device via SWD, JTAG, or USB bootloader. Over-the-air (OTA) updates allow field upgrades.
[[chip//MCU]]
[[peripheral]]
[[I/O//MMIO]]
