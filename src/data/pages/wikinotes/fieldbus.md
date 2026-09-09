---
slug: fieldbus
uid: "ctpMShFs"
address: "industrial//fieldbus"
name: "fieldbus"
date: "2026-09-06"
aliases: ["field network", "serial fieldbus"]
---
The digital networks that connect controllers to field devices, born before industrial Ethernet: serial buses such as [[DVHQFIq1|Modbus]] on [[PrYQJgli|RS-485]], PROFIBUS, and the automotive [[giue07uO|CAN]] bus.
- "Digital" never meant "Ethernet": a fieldbus device is fully digital, addressed on a shared serial line, and has no IP address. Ethernet came later as another link under the same vocabularies ([[uWeRvnh7|protocol stack]], [[1pkzK8nT|industrial Ethernet]]).
- What a fieldbus defines is the conversation (who asks, what operation, which data); what it rides on (RS-485, CAN's differential pair) is defined by the physical standard. Modbus RTU and Modbus TCP are the same conversation on two different stacks.
- Fieldbuses are the layer a plant cannot throw away: a 2003 Modbus meter and a 2006 PROFIBUS DCS keep working for decades, and the digitalization job is to read them through a gateway rather than replace them ([[4jKIn7fG|edge gateway]]).
