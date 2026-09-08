---
uid: "Gr6rH8nW"
address: "ML//RNN//GRU"
name: "GRU"
date: "2026-03-05"
---
Gated Recurrent Unit: a simplified [[rK1Dy2Fa|LSTM]] that merges the forget and input gates into a single "update gate" and combines the cell state and hidden state. Fewer parameters, faster training, comparable performance.
- Two gates instead of LSTM's three: the reset gate controls how much of the previous hidden state to forget, the update gate controls how much of the new candidate state to adopt. The simplification makes GRU cheaper per timestep.
- Like LSTM, GRU was designed to solve the [[7IHpnRNx|vanishing gradient]] problem in [[mBCcy7bn|RNN]]s. The gating mechanism allows gradients to flow through time without shrinking, enabling the model to learn long-range dependencies.
- Performance vs LSTM: on most tasks, GRU and LSTM produce similar results. The choice usually comes down to compute budget (GRU is ~15% faster per step) and dataset size (LSTM's extra gate helps on very large datasets with long sequences)
- Both were superseded by [[QtZjVPKo|Transformers]] for most NLP tasks: attention handles long-range dependencies more naturally than gating through sequential steps. GRU/LSTM survive in low-latency applications (edge devices, real-time signals) where Transformer overhead is prohibitive.
- Historical role: GRU (2014, Cho et al.) appeared shortly after LSTM's revival and quickly became the default "lightweight RNN" option. The competition between GRU and LSTM motivated the search for even simpler sequence models, eventually leading to [[O3ZDwVjm|SSM]]s and [[nRtT0XK7|Mamba]]

