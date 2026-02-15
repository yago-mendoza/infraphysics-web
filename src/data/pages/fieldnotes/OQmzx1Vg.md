---
uid: "OQmzx1Vg"
address: "ARM//Cortex-M"
name: "Cortex-M"
date: "2026-02-05"
---
- ARM's microcontroller profile [[Z9W6rweD|core]] family — optimized for low power, low cost, and deterministic real-time behavior
- The heart of most modern [[gKR2I1Nu|MCU]] devices
- Variants range from Cortex-M0 (tiny, 12K gates) to Cortex-M55 (with Helium vector extensions for [[2mR18V1b|TinyML]])
- Executes Thumb-2 instructions, has a nested vectored interrupt controller (NVIC), and runs bare-metal or RTOS
- Typical [[gKR2I1Nu|MCU]] has 1-2 Cortex-M cores
  + 2 equal cores ⟶ multitask (e.g. Wifi + Bluetooth, or app + comms)
  + 2 different cores ⟶ efficiency (e.g. M7 handles heavy data, M4 watches timers; M7 can sleep while M4 monitors)
- Target: consumer products, start-ups, mass-market devices
