---
uid: "gKR2I1Nu"
address: "electronics//chip//MCU"
name: "MCU"
date: "2026-02-05"
---
- Microcontroller unit — a self-contained [[MTfcKkH5|chip]] integrating [[Z9W6rweD|core]] (often ARM Cortex-M), flash memory, [[jBm8Zuu2|RAM]], and [[PrATEjcr|peripheral]] blocks on a single die
- Peripherals on-die: timers, ADC, UART, SPI, I2C
- Runs bare-metal or RTOS code
- Examples: [[LR9wgzYo|STM32]] (STMicro), [[xVyHlNQa|ESP32]] (Espressif)
- Dominates IoT, automotive, and industrial control; cost, power, and determinism matter more than raw speed
- Has everything inside: [[jBm8Zuu2|RAM]] (~256 KB, stack) + Flash (~1024 KB, [[sNxMwfUX|firmware]])
- Usually contains [[6YzJQiig|ASIC]] helpers on-die (e.g. [[1yDGHLLU|NPU]], DSP, ADC)
- General-purpose: can be a toaster, a drone, a watch, a sensor hub
- [[OQmzx1Vg|Cortex-M]] is the great match for IoT; also wearables (battery life up to 2 years)
- Requires [[6YzJQiig|ASIC]] helpers around it for specialized tasks
---
[[trkh9gwv|SoC]] :: SoCs integrate GPU, NPU, and modem — MCUs focus on real-time control with minimal overhead
[[sNxMwfUX|firmware]] :: MCUs run firmware directly on bare metal or lightweight RTOS, no OS abstraction layer
