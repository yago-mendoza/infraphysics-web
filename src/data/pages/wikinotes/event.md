---
slug: event
uid: "a79KQL3v"
address: "industrial//industrial data layer//event"
name: "event"
date: "2026-09-06"
aliases: ["alarm", "process event", "alarms and events"]
---
Not everything should be stored as a continuous stream of samples. Some things happen once and are recorded as **events**: MotorStarted, PumpStopped, HighPressureAlarm, ValveFault.
- Events feed analysis, maintenance, alarm management, traceability and diagnostics. They are the natural unit for "what happened during that shift", where a [[hwFvgjuo|tag]] trend is the unit for "what value did it have at 18:03".
- Alarms are events with a required human response and their own lifecycle (active, acknowledged, cleared). In a [[7NrcWZUv|DCS]] alarm management is a discipline of its own; a badly rationalized alarm list floods operators during the one incident that matters.
- On the data layer, events travel well over [[JS0lHIsn|MQTT]] and OPC UA's alarms-and-conditions model, and they are the timeline that gives [[SApEgyT4|telemetry]] its context: the sample matters because of the event that framed it.
