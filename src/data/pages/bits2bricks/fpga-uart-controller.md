---
id: fpga-uart-controller
title: fpga-uart-controller
displayTitle: fpga uart controller
category: bits2bricks
date: 2023-12-05
thumbnail: https://images.unsplash.com/photo-1555664424-778a69631025?q=80&w=400&auto=format&fit=crop
description: verilog implementation of serial comms.
---

# fpga uart controller

bridging the gap between software (bits) and hardware (bricks).

implemented a universal asynchronous receiver-transmitter (uart) on a cyclone iv fpga.

![integrated circuit](https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop)

## modules
- baud rate generator
- tx state machine
- rx state machine with oversampling

works reliably at 115200 baud.
