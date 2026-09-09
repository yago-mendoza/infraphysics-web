---
slug: redundant-sensors
uid: "vpwD3eD3"
address: "ML//unsupervised learning//PCA//redundant sensors"
name: "redundant sensors"
date: "2026-09-06"
aliases: ["sensors and PCA example"]
---
Worked example: when a low-variance direction is the most important one for diagnosis. Two sensors measure a common temperature,

{math}
X_1=20+S+\eta_1,\qquad X_2=20+S+\eta_2.
{/math}

\(S\) is process variation with zero mean and variance 4. The noises \(\eta_1,\eta_2\) have zero mean and variance 1, independent of each other and of \(S\). Temperatures are in degrees Celsius, variances in degrees squared.
- What the pairs say. Each sensor has variance \(4+1=5\); their covariance is 4 through the shared signal. So

{math}
\Sigma=\begin{bmatrix}5&4\\4&5\end{bmatrix},\qquad \rho_{12}=\tfrac45=0.8.
{/math}

The covariance has units, the correlation does not. The positive correlation expresses joint variation under the model; it does not by itself prove the shared cause we assumed ([[G8apPDCM|covariance]]).
- Two directions with meaning. \(v_+=(1,1)^{\mathsf T}/\sqrt2\) with \(\lambda_+=9\), and \(v_-=(1,-1)^{\mathsf T}/\sqrt2\) with \(\lambda_-=1\) ([[m5zFVv4g|covariance matrix]]). The common coordinate \(a_+=(X_1+X_2-40)/\sqrt2\) records mostly joint variation. The differential coordinate \(a_-=(X_1-X_2)/\sqrt2\) removes \(S\) exactly under these hypotheses and records the discrepancy between sensors. Keeping only \(v_+\) explains \(9/(9+1)=90\%\) of the variance; the expected squared reconstruction error per sample is 1 in the chosen units.
- What disappears when compressing. The one-component reconstruction is

{math}
\widehat X=\begin{bmatrix}20\\20\end{bmatrix}+v_+v_+^{\mathsf T}\left(X-\begin{bmatrix}20\\20\end{bmatrix}\right)=\begin{bmatrix}(X_1+X_2)/2\\(X_1+X_2)/2\end{bmatrix}.
{/math}

The reconstructed sensors always agree. For the pair \((22,18)\) the reconstruction is \((20,20)\): the four-degree difference vanishes entirely. If the goal was to estimate a common temperature under independent noise, averaging can be reasonable. If the goal was to detect that the sensors disagree, the discarded direction is exactly the one that matters. It cannot be claimed that 90 % of the useful information was kept for both tasks ([[0WlrLnFU|PCA]], [[Vp8NyXtD|projection]]).
- Covariance is not dynamics. The values 9 and 1 are variances, not damping rates. The vector \((1,-1)\) looks like the disagreement pattern of two tanks, but here the matrix does not say that disagreement dies out. Predicting its evolution needs an additional temporal model ([[Xevpd3GQ|modes]]). The sensor model and its values were chosen for this note to separate retained variance from diagnostic relevance.
