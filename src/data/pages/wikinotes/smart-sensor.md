---
slug: smart-sensor
uid: "uuLCFmtk"
address: "robotics//sensor//smart sensor"
name: "smart sensor"
date: "2026-02-05"
---
A [[QSPGKDnh|sensor]] with on-board signal conditioning, ADC, and a small processor (often [[OQmzx1Vg|Cortex-M]]) on the same die or package.
- Outputs calibrated digital data over I2C/SPI instead of raw analog voltage.
- Examples: MEMS accelerometers (Bosch BMA400), environmental sensors (BME680)
- Offloads filtering and fusion from the host [[gKR2I1Nu|MCU]], reducing [[zS3Nqz7G|I/O]] traffic and [[OkJJJyxX|CPU]] load.
- Integrates [[6YzJQiig|ASIC]] + mini [[gKR2I1Nu|MCU]] to:
  + Update threshold/filter dynamically (if A, do X; if B, do Y)
  + Update [[sNxMwfUX|firmware]] itself (e.g. sampling speed) via I2C wires on the [[26t2rDup|PCB]]
- [[trkh9gwv|SoC]] [[OQmzx1Vg|Cortex-M]] variant used for the smartest sensors.
- In a plant the same idea is the industrial smart transmitter: instead of a bare [[83sE6PZQ|4-20 mA]] current it delivers measurement, status, diagnostics, calibration and identity over a digital protocol, [[uOw615AL|HART]] on the old loop or a fieldbus, and appears as a browsable node in [[rAb5Cn20|OPC UA]].
