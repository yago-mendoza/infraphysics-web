---
slug: vertical-drone
uid: "EsNQLPTq"
address: "control//vertical drone"
name: "vertical drone"
date: "2026-09-06"
aliases: ["drone altitude control"]
---
Worked example: state, equilibrium, modes, sensors and control appearing in a single system. A reduction of a planar drone to its vertical motion, with instantaneous thrust and no drag, to isolate the ideas. It is not a flight design ready to implement.
- Plant and state. \(\dot q=v\), \(m\dot v=T-mg\), with \(q\) altitude, \(v\) vertical velocity, \(T\) thrust and \(m\) mass. The [[u18hGtFd|sufficient state]] is \((q,v)^{\mathsf T}\): two drones at the same altitude can have different futures if one is rising and the other falling. For a constant altitude \(r\), equilibrium requires \(q=r\), \(v=0\) and \(T=mg\). The input is not zero: it cancels the weight.
- Deviations and open plant. With \(e=q-r\), \(\delta T=T-mg\) and \(x=(e,v)^{\mathsf T}\),

{math}
\dot x=Fx+B\delta T,\qquad
F=\begin{bmatrix}0&1\\0&0\end{bmatrix},\quad
B=\begin{bmatrix}0\\1/m\end{bmatrix}.
{/math}

The open-loop eigenvalues are zero, but the matrix has a Jordan block: if \(v(0)\ne0\) the position error grows linearly. Those zeros must not be read as neutral stability of the point.
- Controller and closed-loop modes. Choose \(\delta T=-k_pe-k_dv\). Then

{math}
\dot x=\begin{bmatrix}0&1\\-k_p/m&-k_d/m\end{bmatrix}x.
{/math}

With \(m=1\,\mathrm{kg}\), \(k_p=5\,\mathrm{N/m}\) and \(k_d=4\,\mathrm{Ns/m}\), the rates are \(-2\pm i\;\mathrm s^{-1}\): decay with an envelope time constant of \(0.5\,\mathrm s\) and oscillation at \(1\,\mathrm{rad/s}\). There is no force called eigenvalue: those numbers describe the joint effect of the balance and the controller ([[Xevpd3GQ|modes]]).
- What acts and what is observed. For the open plant, \(\mathcal C=[B\;FB]\) has rank two: thrust changes velocity directly and position through integration. Measuring only \(y=e\), \(C=[1\;0]\) and \(\mathcal O=\begin{bmatrix}C\\CF\end{bmatrix}=I\). Velocity is not measured instantly but is observable in the ideal model through the evolution of the altitude. With noise, estimating it takes more than numerically differentiating unfiltered measurements ([[u0TgVFYF|controllability and observability]]).
- Varying reference. For a smooth reference, \(e=q-r\) and \(\dot e=v-\dot r\). The ideal actuation \(T=m(g+\ddot r)-k_pe-k_d\dot e\) gives \(m\ddot e+k_d\dot e+k_pe=0\). The term \(m\ddot r\) is feedforward; the corrections are feedback. The drone can move periodically while the error tends to zero: tracking is not a position equilibrium ([[5zL83qyU|feedback control]]).
- Adding realism. If the motor obeys \(\tau_T\dot T=T_{\mathrm{cmd}}-T\), thrust becomes a state and the command the input: one more mode. Dead time adds another temporal structure ([[hSeQakhh|delay and lag]]). If the computed thrust is negative or above the maximum, the ideal law is no longer realizable and the proof above does not cover that regime ([[iOGYFvso|saturation]]).

## Interactions

- [[8dk62Xwk|Robotics]] : : The drone example is the smallest closed loop robotics runs: one axis, one sensor, one actuator, and already the difference between plant, controller and closed loop
