---
uid: "2oN0bPZY"
address: "mathematics//information theory//channel capacity"
name: "channel capacity"
date: "2026-03-06"
aliases: ["Shannon-Hartley theorem", "noisy-channel coding theorem"]
---
The channel capacity is the fastest rate at which information can cross a noisy channel and still arrive intact, measured in bits per use of the channel. It belongs to the channel, not to the message: the noise, the bandwidth and the power allowed at the input fix it, and no choice of code can move it. What a code can do is get close to it.

The result that gives the number its meaning has two halves. Below capacity there are codes whose errors vanish as the blocks get longer, so noise costs delay and cleverness but not correctness. Above capacity no code works: the errors stay, whatever the scheme. The surprise is that this is a threshold and not a slope. Noise does not trade a little rate for a little reliability all the way down; it draws a line, and on the near side of the line reliable communication is free.

- For the textbook channel, a band-limited signal of power \(S\) in Gaussian noise of power \(N\) over a bandwidth \(B\), the capacity has a closed form, the Shannon-Hartley theorem.

{math}
C = B \log_2\!\left(1 + \frac{S}{N}\right)
{/math}

- The shape of the formula is the lesson. Capacity grows linearly with bandwidth and only logarithmically with the signal-to-noise ratio: doubling the bandwidth doubles the rate, while doubling the power adds about one bit per second per hertz when the signal is already strong, and much less when it is weak. A wider channel beats a louder transmitter, and the last decibels of power are the most expensive way to buy [[Thr0ugh8]].
- What the code has to overcome is the [[JsSUul6f]] the noise adds to every symbol. Capacity is the mutual information between input and output, taken over the best input distribution, so rate above capacity is not *harder to decode*; it is information that never arrived.
- Model capacity is an analogy, not an instance. A model too small for a task keeps making errors however it is prompted, the way a channel driven above capacity keeps making errors however it is coded, and [[iTljPiGW]] read like empirical measurements of that ceiling. [[Et5mN8wJ]] then looks like widening the channel: more compute per problem, more bits to reduce the uncertainty of the answer, up to a ceiling fixed by [[2oNdlB5L]]. The analogy is useful for intuition and has no theorem behind it.

## Interactions

- [[iTljPiGW|scaling laws]] : : Scaling laws measure how a model's ceiling moves with parameters, data and compute, the way capacity moves with bandwidth and SNR; the difference is that capacity is a proved bound on any code and a scaling law is a fit to experiments
