---
uid: "HdnS06xf"
address: "ML//RNN//hidden state"
name: "hidden state"
date: "2026-07-04"
---
The fixed-size vector an [[mBCcy7bn|RNN]] carries from one timestep to the next: a running summary of everything seen so far.
- Updated each step from the new input and the previous hidden state: h_t = tanh(W_x x_t + W_h h_{t-1} + b).
- In an [[rK1Dy2Fa|LSTM]] it is the working output, filtered from the private cell state by the output gate (distinct from the cell state, which is the long-term ledger).
- A prediction never comes from the hidden state directly; a separate readout layer reads it.
