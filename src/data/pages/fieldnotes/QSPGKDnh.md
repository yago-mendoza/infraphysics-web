---
uid: "QSPGKDnh"
address: "Robotics//sensor"
name: "sensor"
date: "2026-02-05"
---
Converts a physical quantity (temperature, acceleration, light, pressure) into an electrical signal.
- Raw analog output is digitized by an ADC for processing.
- A [[uuLCFmtk|smart sensor]] integrates signal conditioning and a local processor on one die.
- Feeds data to [[gKR2I1Nu|MCU]] or [[trkh9gwv|SoC]] platforms in IoT and industrial systems.
- Often connects via [[Yu2rpig0|MMIO]] or serial buses.
- Packaged sensors can resemble [[MTfcKkH5|chip]]s, but their package often exposes a physical interface: a port, membrane, optical window, proof mass, or electrode.
- Sensor performance often depends more on materials, packaging, calibration, and analog design than on access to the newest semiconductor node.
- FIFO buffers on sensors save [[gKR2I1Nu|MCU]] battery by batching data.
- Many measured quantities are analog by nature. Digital sensors simply integrate conversion and processing closer to the transducer; analog outputs remain common when cost, bandwidth, simplicity, or custom signal conditioning matters.
- [[6YzJQiig|ASIC]] pre-processing on sensors standardizes signals for any [[gKR2I1Nu|MCU]]

##### Signal chain

- In smartphones: sensor_1, sensor_2, ... ⟶ [[gKR2I1Nu|MCU]] (decides what to report) ⟶ [[Jkr1CFGJ|MPU]]
- Sensors integrate [[6YzJQiig|ASIC]] for single mathematical threshold/filter (e.g. FFT) at minimal consumption.
- On-sensor processing: [[6YzJQiig|ASIC]] (FFT/ML) saves battery; [[gKR2I1Nu|MCU]] (FFT/[[2mR18V1b|TinyML]]) can be updated.
