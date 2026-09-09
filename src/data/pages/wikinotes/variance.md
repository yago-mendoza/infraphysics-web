---
slug: variance
uid: "PiXdy5JI"
address: "mathematics//statistics//variance"
name: "variance"
date: "2026-09-06"
aliases: ["standard deviation", "dispersion"]
---
How to quantify dispersion without confusing it with useful information. The **variance** is the mean squared deviation from the mean. For a random variable \(X\) with finite second moment,

{math}
\mu=\mathbb E[X],\qquad \operatorname{Var}(X)=\mathbb E[(X-\mu)^2]=\sigma^2.
{/math}

The **standard deviation** \(\sigma=\sqrt{\operatorname{Var}(X)}\) returns the units of \(X\): for a temperature, variance is in degrees squared and standard deviation in degrees.
- Dispersion, concentration and shape. A small variance means little quadratic dispersion around the mean, a large one more. The standard deviation gives a width scale but not the full shape: two distributions can share mean and variance and be very different, symmetric or skewed, unimodal or clustered, with different tails. Extremes weigh a lot because of the square.
- Sample version. For data \(x_1,\ldots,x_N\), \(\bar x=\frac1N\sum_i x_i\) and \(s^2=\frac1{N-1}\sum_i(x_i-\bar x)^2\). The divisor \(N-1\) gives the unbiased estimate under independent, identically distributed sampling with finite variance; dividing by \(N\) describes the dispersion of the empirical distribution. Different purposes: keep one convention when comparing formulas.
- Variance is not information. [[0WlrLnFU|PCA]] maximizes retained variance. Calling it "information" abbreviates the geometric criterion used; it is not a general equality with Shannon [[JsSUul6f|entropy]], predictive power or relevance for a decision. A noisy sensor has high variance; a small difference between two sensors can reveal an important fault. [[vpwD3eD3|redundant sensors]] computes a case where the lowest-variance mode keeps exactly the discrepancy between sensors. There is no universal choice between "much" and "little" variance: ask whether the goal is process variability, measurement uncertainty, compression or diagnosis.
- [[G8apPDCM|covariance]] studies joint variation; the [[m5zFVv4g|covariance matrix]] generalizes variance to any direction; [[Vp8NyXtD|projection]] defines what can be lost when compressing.
