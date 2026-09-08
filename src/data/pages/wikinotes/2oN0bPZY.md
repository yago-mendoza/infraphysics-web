---
uid: "2oN0bPZY"
address: "mathematics//information theory//channel capacity"
name: "channel capacity"
date: "2026-03-06"
aliases: ["Shannon-Hartley theorem", "noisy-channel coding theorem"]
---
The channel capacity is the largest rate, in bits per use of the channel, at which information can cross a noisy channel with an error probability that can be made as small as one likes. It is a property of the channel alone: the noise, the bandwidth, the power allowed at the input. It says nothing about any particular message and nothing about any particular code, only about what the best possible code could achieve. Shannon defined it in 1948, in the paper that founded [[avUhQygt]], and proved the two halves that make the number meaningful.

The coding theorem says that below capacity, codes exist whose error probability goes to zero as the block length grows, and that above capacity no code does: the error probability is bounded away from zero whatever the scheme. Before 1948 the working assumption was that noise imposed a trade-off, less error only at the price of less rate, all the way down to zero rate. Shannon showed instead a threshold: a nonzero rate at which noise costs nothing except delay and cleverness in the code.

- For the archetypal channel, a band-limited signal of power \(S\) in additive white Gaussian noise of power \(N\) over a bandwidth \(B\), the capacity has a closed form, the Shannon-Hartley theorem.

{math}
C = B \log_2\!\left(1 + \frac{S}{N}\right)
{/math}

- The shape of the formula is the lesson. Capacity grows linearly with bandwidth and only logarithmically with signal-to-noise ratio: doubling the bandwidth doubles the rate, doubling the power adds one bit per second per hertz at high SNR and far less at low SNR. This is why a wider channel beats a louder transmitter, and why the last decibels of power are the most expensive way to buy throughput.
- The quantity that the code has to overcome is the [[JsSUul6f]] the noise injects per symbol; capacity is the mutual information between input and output, maximised over the input distribution. Rate above capacity is not "harder to decode", it is information that never arrived.
- Model capacity is an analogy, not an instance. A model too small for a task will keep making errors however it is prompted, the way a channel driven above capacity keeps making errors however it is coded, and [[iTljPiGW]] read like empirical measurements of that ceiling. [[Et5mN8wJ]] then looks like widening the channel: more compute per problem, more bits available to reduce the uncertainty of the answer, up to a ceiling fixed by [[2oNdlB5L]]. The analogy is useful for intuition and has no theorem behind it.

## Interactions

- [[iTljPiGW|scaling laws]] : : Scaling laws measure how a model's ceiling moves with parameters, data and compute, the way capacity moves with bandwidth and SNR; the difference is that capacity is a proved bound on any code and a scaling law is a fit to experiments
