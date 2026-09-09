---
slug: tag
uid: "hwFvgjuo"
address: "industrial//industrial data layer//tag"
name: "tag"
date: "2026-09-06"
aliases: ["process tag", "data quality", "tag quality"]
---
The basic entity of SCADA, historian and OPC systems: a named variable. Tank01.Level, Pump03.Speed, Boiler02.Temperature.

{bkqt/keyconcept|A useful datum is four things}
name: Tank01.Level
value: 74.3 %
timestamp: 18:03:41.215
quality: GOOD
{/bkqt}

- An isolated number, 74.3, is worth very little. The name says what it is, the timestamp says when it was true, and the quality says whether it can be trusted at all: a stale value from a transmitter that lost power is still a number, and quality is what marks it BAD or UNCERTAIN.
- Quality is one of the things a control protocol carries and a plain HTTP response does not, which is part of [[N3kQDfIx|fault semantics]]. Tags are what a [[OShEuklQ|historian]] stores by the billion and what an [[4jKIn7fG|edge gateway]] normalizes when it renames Modbus register 40117 into Boiler01.SteamPressure ([[3xSClPzE|data contextualization]]).

## Interactions

- [[a79KQL3v|event]] : : A tag is a value sampled over and over; an event is something that happened once. Storing a pump state as a tag gives a flat line with steps, storing it as events gives "PumpStarted at 18:03:41". Both are needed and they are not interchangeable
