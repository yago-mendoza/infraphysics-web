---
slug: deadband
uid: "GQxDKEj0"
address: "industrial//industrial data layer//deadband"
name: "deadband"
date: "2026-09-06"
aliases: ["deadband compression", "exception reporting", "report by exception"]
---
A threshold under which a change is not worth reporting: while a value stays within the band around the last recorded sample, no new sample or event is generated; when it crosses the threshold, one is. The small graph with a threshold line in any historian manual is exactly this.
- It reduces three things at once: traffic on the network, storage in the [[OShEuklQ|historian]], and noise in the data. It is the reason a historian can keep years of a signal that changes by a thousandth of a degree.
- The same idea appears on the wire as report by exception (a device sends only when something changed) and in OPC UA subscriptions as a deadband filter. The trade-off is fidelity: a band set too wide erases the small oscillation a diagnostic later needed.

## Interactions

- [[Ewma20xt|EWMA]] : : EWMA smooths a series after it is stored; a deadband decides which samples exist at all. Smoothing can always be undone by keeping the raw data, a deadband cannot, so it has to be set with the future question in mind
