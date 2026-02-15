---
uid: "QSPGKDnh"
address: "sensor"
name: "sensor"
date: "2026-02-05"
---
- Converts a physical quantity (temperature, acceleration, light, pressure) into an electrical signal
- Raw analog output is digitized by an ADC for processing
- A [[uuLCFmtk|smart sensor]] integrates signal conditioning and a local processor on one die
- Feeds data to [[gKR2I1Nu|MCU]] or [[trkh9gwv|SoC]] platforms in IoT and industrial systems
- Often connects via [[Yu2rpig0|MMIO]] or serial buses
- Look like [[MTfcKkH5|chip]]s (tiny black squares) with tiny modifications on top (hole, moving part, light screen)
- Apple ⟶ BOSCH ⟶ [[QSPGKDnh|sensor]] (doesn't require the latest 3nm node)
- FIFO buffers on sensors save [[gKR2I1Nu|MCU]] battery by batching data
- Analogic sensors are only used in extreme environments
- [[6YzJQiig|ASIC]] pre-processing on sensors standardizes signals for any [[gKR2I1Nu|MCU]]
- In smartphones: sensor_1, sensor_2, ... ⟶ [[gKR2I1Nu|MCU]] (decides what to report) ⟶ [[Jkr1CFGJ|MPU]]
- Sensors integrate [[6YzJQiig|ASIC]] for single mathematical threshold/filter (e.g. FFT) at minimal consumption
- On-sensor processing: [[6YzJQiig|ASIC]] (FFT/ML) saves battery; [[gKR2I1Nu|MCU]] (FFT/[[2mR18V1b|TinyML]]) can be updated
