---
slug: register-map
uid: "DML5M3qP"
address: "industrial//fieldbus//Modbus//register map"
name: "register map"
date: "2026-09-06"
aliases: ["Modbus registers", "holding registers", "downstream register manual"]
---
The vendor document that says what each Modbus address means. The client must know two things: which address to read and what data type it holds.

{bkqt/note|What Modbus sends and what the manual adds}
The device says: 40001 = 217, 40002 = 64, 40003 = 1.
The register map says: 40001 is temperature in tenths of a degree (21.7 C), 40002 is pressure in tenths of a bar (6.4 bar), 40003 is the pump running flag.
{/bkqt}

- [[DVHQFIq1|Modbus]] contributes practically no semantics. Without the map you receive numbers and cannot tell what they are; scaling factors, signedness, byte order and 32-bit values split across two registers are all conventions of the manufacturer.
- "Know the downstream register manual" is therefore the first step of any integration: the PLC or gateway logic is programmed against those addresses, and every device of another brand has a different map ([[cb9f4huK|system integrator]]).
- The register map is the smallest possible data model, and the contrast that explains why [[rAb5Cn20|OPC UA]] exists: an address and a raw number against a named node with value, unit, quality and timestamp.
