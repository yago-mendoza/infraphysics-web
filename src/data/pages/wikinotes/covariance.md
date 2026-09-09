---
slug: covariance
uid: "G8apPDCM"
address: "mathematics//statistics//covariance"
name: "covariance"
date: "2026-09-06"
aliases: ["correlation", "Pearson correlation"]
---
How to tell joint variation, normalized association and causality apart. The **covariance** measures how deviations from the means align,

{math}
\operatorname{Cov}(X,Y)=\mathbb E[(X-\mu_X)(Y-\mu_Y)].
{/math}

If both deviations tend to share a sign it is positive; if they tend to oppose, negative. Its magnitude depends on the scales and its units are \([X][Y]\). [[PiXdy5JI|Variance]] is the special case \(\operatorname{Cov}(X,X)\). Covariance is not "more useful" in general: it answers a question about two variables, variance about one.
- Pearson correlation. If both standard deviations are finite and nonzero,

{math}
\rho_{XY}=\frac{\operatorname{Cov}(X,Y)}{\sigma_X\sigma_Y},\qquad -1\le\rho_{XY}\le1.
{/math}

\(\rho\) is a **dimensionless** coefficient: it removes positive changes of unit and summarizes linear association. Flipping the orientation of one axis flips its sign. If one variable is constant the expression is undefined; it must not be replaced by zero automatically.
- A joint distribution is required. A scatter plot shows observed pairs \((x_i,y_i)\) from the same case, object or comparable instant. Knowing only the marginal of \(X\) and the marginal of \(Y\) does not fix their covariance: one needs to know how they pair up. Two temperature sensors read at the same time give pairs; two lists with no established correspondence do not define the same statistical question.
- Zero does not mean independence. Let \(X\) be uniform on \([-1,1]\) and \(Y=X^2\). By symmetry \(\mathbb E[X]=\mathbb E[X^3]=0\), so \(\operatorname{Cov}(X,Y)=0\), yet \(Y\) is fully determined by \(X\). Zero correlation rules out that linear association, not every dependence. Independence implies zero covariance when the moments exist; the converse needs extra hypotheses.
- Association does not determine mechanisms. Temperature and electricity consumption can covary through common demand, direct causation, control or omitted variables. A covariance is not the [[u38TIs0J|coupling coefficient]] of a dynamic equation, and a statistical network built from correlations must declare that construction ([[YRGQ0acp|adjacency and degree]]).
- The [[m5zFVv4g|covariance matrix]] gathers many of these associations at once.
