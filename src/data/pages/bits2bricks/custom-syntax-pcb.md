---
id: custom-syntax-pcb
title: custom-syntax-pcb
displayTitle: custom syntax pcb
category: bits2bricks
date: 2025-01-30
thumbnail: https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop
description: bridging markup syntax and hardware notation.
tags: [pcb, hardware, syntax]
---

# custom syntax pcb

hardware documentation benefits from rich inline formatting. a PCB design log is the perfect test case.

## component values

the bypass cap is {sc:mlcc} type, rated at 100{sc:nf}. supply voltage: V{v:cc} = 3.3V, max current I{v:max} = 500mA.

power dissipation: P = I{^:2} x R = (0.5){^:2} x 10 = {#e74c3c:2.5W} — {==:too hot without a heatsink}.

## status annotations

- {#2ecc71:PASS} — uart tx verified at 115200 baud
- {#e74c3c:FAIL} — rx oversampling glitch at {~:edge cases}
- {#f39c12:PENDING} — {-.:thermal testing incomplete}

## cross-references

this board interfaces with a [[Headless device]] via serial. the debug output renders through a [[UI//GUI]] terminal emulator.

the uart protocol itself is documented in the fpga-uart-controller project.

## keyboard shortcuts for the test bench

{kbd:F5} — run test suite
{kbd:Ctrl+R} — reset FPGA
{kbd:Ctrl+Shift+L} — capture logic analyzer trace

> {..:note}: the {_:pull-up resistors} on the I{^:2}C bus measured 4.7k, within spec for V{v:dd} = 3.3V.
