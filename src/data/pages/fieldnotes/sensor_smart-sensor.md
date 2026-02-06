---
address: "sensor//smart sensor"
date: "2026-02-05"
---
A [[sensor]] with on-board signal conditioning, ADC, and a small processor (often [[ARM//cortex-M]]) integrated on the same die or package. Outputs calibrated digital data over I2C/SPI instead of raw analog voltage. Examples: MEMS accelerometers (Bosch BMA400), environmental sensors (BME680). Offloads filtering and fusion from the host [[component//chip//MCU]], reducing [[I/O]] traffic and [[CPU]] load.
[[sensor]]
[[ARM//cortex-M]]
[[component//chip//MCU]]
