---
slug: scan-cycle
uid: "KgAxnFjV"
address: "industrial//industrial automation//PLC//scan cycle"
name: "scan cycle"
date: "2026-09-06"
aliases: ["PLC scan", "cycle time"]
---
The loop a PLC repeats forever: read the inputs, execute the program, update the outputs, do communications and diagnostics, and start again.
- One pass can take from microseconds to tens of milliseconds depending on the controller and the program size. The point is not that it is fast but that it is bounded: every scan, every input is sampled and every output is refreshed.
- Inputs are read once at the start of the scan into an image table, so the logic sees a consistent snapshot; outputs are written once at the end. A signal shorter than one scan can be missed unless the hardware latches it or an interrupt task exists.
- This loop is what makes classic automation predictable, and it is the concrete form of determinism: a condition gets a response within a known number of scans, not "eventually".
- The [[nnXbK36S|IEC 61131-3]] program is what runs in the middle of the loop; the [[mfLejTTj|PLC]] hardware does the rest.

## Interactions

- [[SQo89ykf|discretization]] : : The scan cycle is a sampling period imposed by the controller: the plant is continuous, the PLC sees it and acts on it once per scan, which is exactly the continuous-to-discrete step that fixes the loop's time base
