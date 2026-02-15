---
uid: "26t2rDup"
address: "manufacturing//PCB"
name: "PCB"
date: "2026-02-05"
---
- Printed circuit board — fiberglass-and-copper substrate that mechanically supports and electrically connects [[MTfcKkH5|chip]] components via etched traces
- Design tools: KiCad, Altium
- Manufacturing involves layer stackup, drilling, plating, solder mask, and silkscreen
- A [[gKR2I1Nu|MCU]] or [[Jkr1CFGJ|MPU]] sits on the PCB alongside passives (resistors, capacitors), connectors, and power regulation
- Board complexity ranges from 2-layer hobbyist to 20+ layer server motherboards
- Design: KiCad ⟶ fabrication in China (JLCPCB, PCBWay) ~0.50 EUR + welding
- Copper traces connect EXACT pins of specific chips and [[QSPGKDnh|sensor]]s; if you change a chip, the PCB becomes useless
- Suit shape and size to the target device
- Charging options: POGO pins (golden little dots), NFC, USB
- NVLink on PCB connects multiple [[58TuBQEb|Orin]] chips for scaled-out compute
