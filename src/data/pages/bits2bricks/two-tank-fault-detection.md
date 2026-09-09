---
slug: two-tank-fault-detection
id: "3142718"
displayTitle: "Model-based fault detection in a two-tank system"
subtitle: "Structural analysis of thirteen component relations, four analytical redundancy relations, threshold calibration on healthy runs and signature-based isolation of leak, valve, pump and sensor faults"
category: bits2bricks
date: "2026-08-28"
thumbnail: https://cdn.infraphysics.net/articles/3142718/cover.webp
thumbnailAspect: full
thumbnailShading: light
description: "Model-based fault detection and isolation on a two-tank hydraulic plant under closed-loop control. Thirteen component relations are reduced by structural analysis to four analytical redundancy relations, evaluated as residuals on Simulink runs, thresholded on healthy data and matched against a fault-signature matrix. Covers detectability and isolability, the noise cost of differentiating level measurements, the failure of exact signature matching, and the calibration a physical installation would require."
tags: ["control","fault diagnosis","linear algebra","physics","simulation"]
complexity: 7
---

A tank leaks. The PI controller sees the level drop, opens the pump a bit more, and puts the level right back on the setpoint. The dashboard stays green. Water is still going onto the floor.

No level alarm will ever see that. This page is about the thing that does: **compile the plant's own physics into tests.** Take the equations, kill every variable you can't measure, and whatever is left has to be zero while machine and model agree. Then watch zero. Model-based fault detection and isolation, FDI. Two tanks, thirteen equations, four numbers.

What you get out of it, concretely: how conservation laws and component models become four residual signals; how a structural analysis (an incidence matrix, a graph) tells you which residuals are even computable before you touch any algebra; how the pattern across residuals names the broken component instead of just screaming; and where the whole thing falls apart on real hardware, which is noise, differentiation and thresholds picked from a single run.

Why you should care if you don't own a water tank: this is the skill behind every *condition monitoring*, *predictive maintenance* and *prognostics* posting that never says what the job is. The job is this. Most failures on a factory floor don't announce themselves. Control loops absorb them until a seal lets go, a pump cavitates or a bearing seizes, and by then the maintenance window is gone. Catching that early is a residual problem, not a dashboard problem, and the same four-residual skeleton runs in electrical drives, HVAC, battery packs and chemical reactors. The autoencoder-on-sensor-streams version is what vendors sell. The physics version is what gets past the safety engineer. Learn this one first.

The material is a 2023 university exercise: a Simulink model, a LaTeX report with the matrices, screenshots of the runs. Where the report was wrong (units, and one explanation of a pump fault) I say so below and fix it.

![Diagram of two connected water tanks|The whole plant: two tanks, one pump, two valves, two controllers and five measured signals. Everything the detector will ever know is on this picture.](https://cdn.infraphysics.net/articles/3142718/figures/two-tank-schematic.webp "center")

# Your controller is lying to you

The leak in the opening is not a bug. That is the controller doing its job. A [[iOGYFvso|feedback loop]] exists to hide disturbances from the output, and a leak is a disturbance. Every controller on earth is a fault-hiding machine. The better the tuning, the better it hides.

So asking whether the level is too low is the wrong question, and limit checking (compare a sensor to a fixed number, raise an alarm) is a smoke detector with the battery pulled. The right question is: **does the water going in, going out and piling up actually add up?** Conservation doesn't care what the controller wants. If the books don't balance, something is wrong, and there are only a handful of suspects.

# What this method is, and what it isn't

The grown-up name is model-based fault detection and isolation, FDI. The model says what healthy behaviour must satisfy. Measurements break some of those constraints when a part fails. The disagreement signals are called residuals. That's it. That's the field. Forty years of papers hang off that one sentence.

This particular build sits on the parity-relation side of it: you rearrange the plant equations until the internal states vanish and only measured stuff is left. Structural analysis (the incidence matrix, the graph) tells you which eliminations are even possible before you waste an afternoon on symbolic algebra.

People love to call this *old school* because the final code is tiny. That's confusing two layers that have nothing to do with each other:

- **Generating the residuals is model-based.** Conservation laws and component equations decide what each residual checks. This part is rigorous.
- **Evaluating the residuals is a hack here.** I picked thresholds from one healthy run, turned the residuals into bits and matched bits. This part is a student with a deadline.

The first layer has serious literature. Parity equations, diagnostic observers, Kalman innovations: three ways to generate a residual, and a classic IFAC synthesis shows parity and observer designs collapse into each other once you line up their objectives. Read [Analytical Redundancy Methods in Fault Detection and Isolation](https://www.sciencedirect.com/science/article/pii/S1474667017511192) and the later [parity-space and observer tutorial](https://www.sciencedirect.com/science/article/pii/S1474667017364686) if you want the receipts. They differ in representation and in how gracefully they eat noise. They do not differ in the idea. The idea is to compare what happened with what should have happened.

So no, this is not *machine learning before machine learning*. It's the opposite way of injecting knowledge. Instead of learning what normal looks like from ten thousand examples, you write down what normal has to obey. If your detector needs a dataset to find out that water is conserved, you don't have a data problem. You have a thinking problem.

{bkqt/keyconcept}
*Control and diagnosis ask different questions.* A controller asks what input moves the system toward the reference; a diagnoser asks which physical assumption just stopped agreeing with the measurements. Same sensors, same model, completely different job, and confusing the two is how you end up with a plant that looks healthy right up to the moment it isn't.
{/bkqt}

Two tanks are the perfect microscope for this because nothing can hide. Water has to go somewhere. If the arithmetic doesn't close, you have maybe five suspects and they all live on one diagram.

# The plant, in one breath

Tank \(T_1\) gets filled by pump \(P_1\). A digital PI controller holds its level at \(h_{1c}=0.5\,\mathrm{m}\). Water crosses into \(T_2\) through valve \(V_b\), driven by a dumb on/off controller that opens whenever \(h_2\le0.09\,\mathrm{m}\) and shuts once the level is back in its band. Valve \(V_o\) is the consumer, sucking water out of tank 2.

The parameters fit on a napkin:

{params}
# Geometry
\(A_1, A_2\) = \(1.54\times10^{-2}\,\mathrm{m^2}\) # Tank cross-section
\(h_{max}\) = \(0.6\,\mathrm{m}\) # Maximum level

# Flow laws
\(C_{vb}\) = \(1.5938\times10^{-4}\,\mathrm{m^{5/2}/s}\) # Inter-tank valve coefficient
\(C_{vo}\) = \(1.5964\times10^{-4}\,\mathrm{m^{5/2}/s}\) # Outlet valve coefficient
\(k_{pump}\) = \(10^{-3}\) # Pump gain
\(Q_{pmax}\) = \(0.01\,\mathrm{m^3/s}\) # Maximum pump flow

# Injected faults
\(Q_{f1}, Q_{f2}\) = \(10^{-4}\,\mathrm{m^3/s}\) # Leak flow
{/params}

Small confession on the units. The 2023 report (and the first version of this page) wrote the valve coefficients in \(\mathrm{m^3/s}\). Wrong. They get multiplied by a square root of a level, which has units \(\mathrm{m^{1/2}}\), and the product has to be a volumetric flow. So the coefficient is \(\mathrm{m^{5/2}/s}\). Nobody checked. Three years. Check your units, it costs nothing and it catches exactly this.

The model ignores fluid inertia, valve dynamics and temperature. Read that sentence again, because it's the most important one on the page. A model is not reality written in maths. It's a negotiated list of what you can afford to ignore. Every residual we build below is only as honest as that list.

# Conservation is the only law you need

Cylindrical tanks, so \(V_i=A_ih_i\). Conservation of volume:

{math}
\frac{dV_1}{dt}=Q_p-Q_{12},
\qquad
\frac{dV_2}{dt}=Q_{12}-Q_o
{/math}

Substitute the geometry:

{math}
A_1\dot h_1=Q_p-Q_{12},
\qquad
A_2\dot h_2=Q_{12}-Q_o
{/math}

This is a ledger. Left side is what piles up. Right side is what came in minus what went out. Money in, money out, except the money is water and the accountant is a differential equation.

The pump is linear until it isn't:

{math}
Q_p=
\begin{cases}
0,&U_p<0\\
k_{pump}U_p,&0\le U_p\le U_{pmax}\\
Q_{pmax},&U_p>U_{pmax}
\end{cases}
{/math}

Flow between the tanks goes with the square root of the head difference. The sign term lets water flow backwards if tank 2 is ever higher than tank 1:

{math}
Q_{12}=C_{vb}\operatorname{sgn}(h_1-h_2)\sqrt{|h_1-h_2|}\,U_b
{/math}

The outlet is the same thing with one tank:

{math}
Q_o=C_{vo}\sqrt{h_2}\,U_o
{/math}

Those square roots are not decoration. They're where the nonlinearity lives. Double the pressure head and the flow does not double, it grows by \(\sqrt2\). Every *let's just linearise it* instinct you have is a small lie you're choosing to tell around one operating point. The original exercise kept the square roots. Good. Keep them.

# Two controllers, one of them dumb on purpose

Tank 1 gets a PI:

{math}
U_p(t)=K_p\bigl(h_{1c}-h_1(t)\bigr)+K_i\int_0^t\bigl(h_{1c}-h_1(\tau)\bigr)d\tau
{/math}

with \(K_p=10^{-3}\), \(K_i=5\times10^{-6}\), sampled once a second. The proportional term reacts to the error right now. The integral term holds a grudge about error that has persisted. Ideal A/D on the way in, zero-order hold on the way out.

Tank 2 gets a light switch:

{math}
U_b=
\begin{cases}
1,&0\le h_2\le0.09\\
0,&0.09<h_2\le h_{2max}
\end{cases}
{/math}

On, off, on, off. So \(h_2\) is supposed to chatter inside a band, not settle on a nice number. Notice how much is already going on in this *toy*: continuous physics, sampled control, saturation, switching. Tiny plant. Not a tiny problem.

![Simulink implementation of the plant and sensors|The Simulink model. The controllers run the plant; a parallel diagnostic path watches the same five signals and keeps its own opinion.](https://cdn.infraphysics.net/articles/3142718/figures/simulink-model.webp "center")

# Thirteen tiny truths

Now the part I didn't get in 2023. Instead of one big state-space equation, the structural model chops the plant into thirteen elementary relations. Uglier. Massively more useful. Faults belong to components, so the model has to keep component boundaries visible or you'll never be able to point at the broken part.

| Model | Relation | Component |
|---|---|---|
| \(M_1\) | \(\dot V_1=Q_p-Q_{12}\) | Tank 1 balance |
| \(M_2\) | \(V_1=A_1h_1\) | Tank 1 geometry |
| \(M_3\) | \(\dot V_2=Q_{12}-Q_o\) | Tank 2 balance |
| \(M_4\) | \(V_2=A_2h_2\) | Tank 2 geometry |
| \(M_5\) | \(Q_p=f(U_p)\) | Pump |
| \(M_6\) | \(Q_{12}=f(h_1,h_2,U_b)\) | Inter-tank valve |
| \(M_7\) | \(Q_o=f(h_2,U_o)\) | Outlet valve |
| \(M_8\) | \(U_p=PI(h_{1c}-h_1)\) | PI controller |
| \(M_9\) | \(my_1=h_1\) | Tank 1 level sensor |
| \(M_{10}\) | \(my_2=h_2\) | Tank 2 level sensor |
| \(M_{11}\) | \(mQ_p=Q_p\) | Pump-flow sensor |
| \(M_{12}\) | \(mU_p=U_p\) | Pump-command sensor |
| \(M_{13}\) | \(mU_b=U_b\) | Valve-command sensor |

Look at \(M_9\). It says the measured level equals the real level. Obvious? It's the single smartest line in the table. \(h_1\) is the physical level, which you will never know. \(my_1\) is what a sensor claims. In healthy operation they're equal. When the sensor dies, that equality is precisely what breaks, and because it's its own equation, the break has its own address. Merge the two and a dead sensor becomes indistinguishable from a leak. Don't merge them.

# Structure before numbers

Before solving anything, put a 1 wherever relation \(M_i\) contains variable \(x_j\). That's the incidence matrix. This is the original one from the report, rebuilt for the web instead of replaced with some generic infographic.

![Incidence matrix of the two-tank model|The original LaTeX incidence table. The heavy horizontal line splits physical equations from sensor equations.](https://cdn.infraphysics.net/articles/3142718/figures/incidence-matrix.svg "full")

This matrix knows nothing. No square roots, no gains, no litres per second. Pure wiring. Row \(M_6\) touches \(h_1,h_2,U_b,Q_{12}\), and that alone is enough to say which equations could compute which variables and which components can reach which residual.

Same information as a bipartite graph, and suddenly the substitution problem is a thing you can look at:

![Relational graph of equations and variables|The original TikZ relational graph. Sensor branches stay pale red, exactly as in the LaTeX source.](https://cdn.infraphysics.net/articles/3142718/figures/relational-graph.webp "full")

Structural analysis throws away every number on purpose. That feels like vandalism and it is. The payoff is combinatorial: you can hunt for subsets of equations with one more equation than unknowns. Solve the unknowns with a matching, and the leftover equation has nowhere to go. It becomes a consistency test.

{math}
\text{redundancy}=\#\text{equations}-\#\text{unknowns}
{/math}

Zero: the subset can just barely determine its own unknowns. One: it can determine them and still check itself. The IFAC paper [A method to get analytical redundancy relations for fault diagnosis](https://www.sciencedirect.com/science/article/pii/S2405896317305207) walks the same road: start overdetermined, reduce to expressions that only contain measured signals and their derivatives.

Now the caveat my 2023 self skipped, and it's not a small one. **Counting one extra equation is a candidate for a test, not a proof you have one.** Equations can be dependent. Coefficients can vanish. A differential relation can demand a derivative you don't have. Write \(x=z_1\) and \(2x=z_2\) and you get a real test, \(z_2-2z_1=0\). Write \(x=z_1\) twice and you get two rows on paper and zero information. The incidence matrix cannot tell those apart. Rank can. Structure gets you the candidates; numerics decides which ones are alive.

# Analytical redundancy is a spare sensor made of algebra

Hardware redundancy: bolt on a second level sensor and compare. Analytical redundancy: use the rest of the plant to predict what the first sensor should have said.

If I know the pump inflow, the valve command and the tank 2 level, the tank 1 balance gives me an independent opinion about how tank 1 must be evolving. Nobody added a probe. The spare sensor was sitting inside the equations the whole time, unpaid.

The original assignment then adds causality. `P` is an algebraic relation, `I` marks a variable reached by integration, `O` marks one that needs differentiation. What matters for the detector is which equations each residual ends up using, and the four residuals below do not use disjoint sets: the two tank balances share the valve equation and three of the sensor equations, which is exactly why a valve fault will show up in two residuals at once.

![Equation-to-residual dependencies|Thirteen equations against four residuals. ARR1 and ARR2 share M6, M9, M10 and M13. The table follows the residuals as written below, not the archived coloured paths.](https://cdn.infraphysics.net/articles/3142718/figures/tabla-arr.svg "full")

The same table, interactive: [[playgrounds/3142718/tabla-arr|pick any two residuals and see which equations they share]].

## Residual 1: the tank 1 ledger

Substitute the measured levels and measured pump flow into \(M_1\), then the valve law for \(Q_{12}\):

{math}
r_1=A_1\frac{d m_{y1}}{dt}-mQ_p
+C_{vb}\operatorname{sgn}(m_{y1}-m_{y2})
\sqrt{|m_{y1}-m_{y2}|}\,mU_b
{/math}

Healthy means \(r_1\approx0\). A tank 1 leak is an outflow the model never heard of. A valve fault changes the real \(Q_{12}\) without changing the commanded \(mU_b\). Both make the ledger fail.

Note what \(r_1\) uses for the inflow: **the measured pump flow, not the pump model.** Hold that thought. It matters later, when I explain a mistake I published.

## Residual 2: the tank 2 ledger

{math}
r_2=A_2\frac{d m_{y2}}{dt}
-C_{vb}\operatorname{sgn}(m_{y1}-m_{y2})
\sqrt{|m_{y1}-m_{y2}|}\,mU_b
+C_{vo}\sqrt{m_{y2}}\,U_o
{/math}

Reacts to a tank 2 leak and to the same inter-tank valve fault. The valve is shared by both balances, so it leaves a two-residual footprint. That's not a nuisance, that's a fingerprint.

## Residual 3: did the PI actually produce this command?

{math}
r_3=mU_p-K_p(h_{1c}-m_{y1})
-K_i\int_0^t(h_{1c}-m_{y1})d\tau
{/math}

This one checks the controller chain, not the hydraulics. If the measured command disagrees with the PI law evaluated on the measured level, something between the level sensor and the pump command is inconsistent.

One trap. The replay in \(r_3\) must be the real implementation: same sample clock, same integrator initial state, same saturation, same anti-windup. Copy a textbook continuous PI into a monitor of a discrete, saturating PI and you have built a residual that fires on your own laziness.

## Residual 4: did the pump obey?

Away from saturation:

{math}
r_4=mQ_p-k_{pump}mU_p
{/math}

The smallest ARR and the easiest to explain to a five-year-old. Command says ten, flow sensor says four, pump model says those two cannot both be true.

{bkqt/warning}
*The piecewise model matters.* The compact \(r_4\) is only valid in the pump's linear region. A real residual generator has to evaluate the same piecewise law as \(M_5\), zero flow and saturation included. Skip that and every normal saturation event looks exactly like a pump fault. You will be woken up at 3 a.m. by a pump that is fine.
{/bkqt}

# A fault is a four-bit word

A residual tells you some relation is inconsistent. It doesn't name the broken part. Isolation comes from the pattern across all four.

| Fault mode | \(r_1\) | \(r_2\) | \(r_3\) | \(r_4\) | Signature |
|---|---:|---:|---:|---:|---:|
| Healthy | 0 | 0 | 0 | 0 | 0000 |
| Pump fault | 0 | 0 | 0 | 1 | 0001 |
| Leak in tank 1 | 1 | 0 | 0 | 0 | 1000 |
| Leak in tank 2 | 0 | 1 | 0 | 0 | 0100 |
| Pump-command sensor fault | 0 | 0 | 1 | 1 | 0011 |
| Inter-tank valve fault | 1 | 1 | 0 | 0 | 1100 |

Two properties fall out for free:

- **Detectability.** Every fault column has at least one 1. No fault on the list can happen without disturbing something.
- **Isolability.** Every column is different. Detect it, and the ideal signature tells you which one.

So the detector is a tiny pipeline: measurements in, the four ARRs, one threshold per residual, four bits, and a lookup against the signature table.

The clever bit is not the lookup. Anyone can write a lookup. The clever bit is designing residuals whose sensitivities overlap in carefully different ways. \(r_4\) alone points at the pump. \(r_3\) and \(r_4\) together point upstream, at the command measurement. \(r_1\) and \(r_2\) together point at the one valve both tanks share.

A fault becomes a four-bit word. Say it out loud, it's kind of beautiful.

# What zero looks like when a computer does it

*Residual equals zero* is theory talk. In a sampled simulation, differentiation, integration, switching and solver tolerances all leave crumbs. The healthy runs show the floor we actually got:

![Healthy residual 1|Healthy r1. Valve switching plus numerical differentiation leave visible transients.](https://cdn.infraphysics.net/articles/3142718/figures/healthy-r1.webp "pair")
![Healthy residual 2|Healthy r2. Its normal envelope is not even symmetric around zero.](https://cdn.infraphysics.net/articles/3142718/figures/healthy-r2.webp "pair")

![Healthy residual 3|Healthy r3. The controller relation stays extremely close to zero.](https://cdn.infraphysics.net/articles/3142718/figures/healthy-r3.webp "pair")
![Healthy residual 4|Healthy r4. In this ideal model the pump relation is exact. Suspiciously exact.](https://cdn.infraphysics.net/articles/3142718/figures/healthy-r4.webp "pair")

The 2023 calibration took the largest healthy absolute value and called it a threshold:

| Residual | Healthy minimum | Healthy maximum | Chosen threshold |
|---|---:|---:|---:|
| \(r_1\) | \(-1.064\times10^{-4}\) | \(9.6\times10^{-5}\) | \(1.064\times10^{-4}\) |
| \(r_2\) | \(-6.0\times10^{-5}\) | \(1.37\times10^{-4}\) | \(1.37\times10^{-4}\) |
| \(r_3\) | \(-9.98\times10^{-8}\) | \(9.98\times10^{-8}\) | \(9.98\times10^{-8}\) |
| \(r_4\) | 0 | 0 | 0 |

Zero false alarms on the run used to pick the thresholds. Which guarantees exactly nothing about any other run. That's not calibration, that's memorising the answer key.

The zero threshold on \(r_4\) is the tell. Real flow sensors have quantisation, noise, bias and latency. Pump gain drifts with supply voltage, wear and operating point. \(mQ_p\) and \(mU_p\) may not even be sampled at the same instant. On hardware you start with a noise model, estimate the healthy residual distribution across operating regimes, add hysteresis and demand persistence over several samples. \(3\sigma\) is a decent first guess, not a law of nature. Also, look at the healthy \(r_1\) plot again: there's a startup spike around \(5\times10^{-4}\), five times the threshold. The report never excluded a startup window. So *no false alarms on the healthy run* was never even true as stated. It was true after the operator stopped looking.

And there's a typo. The table says \(9.98\times10^{-8}\) for \(r_3\). The code says \(9.98\times10^{-10}\). A factor of a hundred. That's not editorial dust, that's two detectors pretending to be one. The code and the document need a single source of truth or the document is fiction.

# Don't differentiate noise. Integrate it.

Both ledgers contain \(\dot m_{y}\), a derivative of a measured level. Fine on paper. On a real sensor it's a disaster. Take a one-step difference of a level with independent noise \(\sigma_h\) and the noise on the derivative is

{math}
\sigma_{\dot y}=\frac{\sqrt2\,\sigma_h}{\Delta t}.
{/math}

Divide by the sample time. Sample faster to *see the leak sooner* and you amplify the noise faster. Then you multiply by the tank area and dump the result straight into a flow residual whose threshold is \(10^{-4}\). This is the most common way I've seen model-based detectors die in practice: not a wrong model, a raw differentiator.

The fix is dull and it works. Integrate the balance over a window \(T\) instead of differentiating it:

{math}
R_1(t)=\frac{A_1\bigl[m_{y1}(t)-m_{y1}(t-T)\bigr]-\int_{t-T}^{t}\bigl(mQ_p-\widehat Q_{12}\bigr)d\tau}{T}.
{/math}

Still a flow residual. Still \(-Q_{f1}\) for a constant leak filling the window. But now only two level samples enter, and their noise is divided by \(T\) instead of \(\Delta t\). In code it's a running flow integral and a ring buffer of old levels. No symbolic algebra at the sample rate. An observer does the same job with more ceremony. Either way: never hand a finite difference of a noisy sensor to a threshold and call it engineering.

# Break things on purpose

The leak and valve experiments behave exactly the way the structure said they would:

![Tank 1 leak seen by residual 1|A tank 1 leak is an outflow the model never modelled. r1 leaves its healthy envelope and stays out.](https://cdn.infraphysics.net/articles/3142718/figures/tank-1-leak-r1.webp "pair")
![Valve fault seen by residual 1|A valve fault corrupts the inter-tank flow r1 assumed.](https://cdn.infraphysics.net/articles/3142718/figures/valve-fault-r1.webp "pair")

![Tank 2 leak seen by residual 2|The second ledger catches its own leak.](https://cdn.infraphysics.net/articles/3142718/figures/tank-2-leak-r2.webp "pair")
![Valve fault seen by residual 2|The same valve fault also breaks the tank 2 balance. That completes 1100.](https://cdn.infraphysics.net/articles/3142718/figures/valve-fault-r2.webp "pair")

The sensor and pump experiments exercise the controller-actuator chain:

![Command-sensor fault seen by residual 3|The measured command no longer matches the PI calculation.](https://cdn.infraphysics.net/articles/3142718/figures/sensor-fault-r3.webp "pair")
![Pump fault seen by residual 4|The measured flow no longer matches the commanded pump flow.](https://cdn.infraphysics.net/articles/3142718/figures/pump-fault-r4.webp "pair")

![Command-sensor fault seen by residual 4|The same command-measurement fault reaches the pump relation too. Second bit of 0011.](https://cdn.infraphysics.net/articles/3142718/figures/sensor-fault-r4.webp "center")

Now the ugly part, and the part I got wrong the first time I wrote this up.

In the recorded comparison table, the pump-fault run doesn't only trip \(r_4\). It also trips \(r_1\) and \(r_2\). The ideal signature says 0001. The simulation, after thresholding, says something like 1101. The first version of this article waved that away as *closed-loop propagation*: the controller reacts to the fault, the levels move, other residuals get excited. Sounds plausible. It's wrong.

Go back to \(r_1\). It uses the **measured** pump flow. If the pump loses capacity and its flow sensor is honest, the tank 1 balance still closes. Less water comes in, the sensor says less water comes in, the level does what less water makes it do. Conservation doesn't care how the controller feels about it. An exact balance equation cannot be made false by a different trajectory. So those extra alarms weren't physics. They were an implementation discrepancy: a timing mismatch between signals, a raw differentiator chewing on a faster transient, a flow reading that isn't what the pump actually delivered. Which one? The archived screenshots can't say. That's what you get for keeping PNGs and throwing away the data.

I'd rather publish the correction than keep a nice story. And the correction is more useful than the story, because it's a rule: **when a residual fires that structure says can't fire, suspect your implementation before you suspect your physics.**

Five things that would make the decision layer less brittle, in the order I'd do them:

a. Keep an *unknown fault* outcome. Forcing every unseen bit pattern into a known label is precisely how a diagnostic system becomes confidently wrong. This one first.

b. Use time. Match the residual that fires first, not just the final binary vector.

c. Rank candidates by weighted residual magnitude instead of demanding an exact bit match.

d. Design decoupled residuals that suppress secondary sensitivities where you can.

e. Calibrate thresholds by operating region, especially around valve switching and pump saturation.

# Put it next to the neighbours

I wanted a more honest comparison than *physics good, machine learning also good*. Every method spends its complexity somewhere. The question is where.

| Method | What makes the residual | What it buys | What hurts |
|---|---|---|---|
| Limit checking | Raw sensor minus fixed limit | Free, easy to certify | Weak isolation, blind to coupling, fooled by any controller |
| These ARRs | Eliminated physical constraints | Component-level structure, nonlinearities stay visible | Derivatives amplify noise; model mismatch leaks everywhere |
| Parity space | Projection orthogonal to healthy input-output behaviour | Systematic design over a time window | Cleaner for linear plants than switching nonlinear ones |
| Luenberger or unknown-input observer | Measured output minus estimated output | State estimates, disturbance decoupling, filtering | Observer design and observability assumptions |
| Kalman filter | Innovation from stochastic state estimation | Noise covariance is explicit | Gaussian and model assumptions can be badly wrong |
| Parameter estimation | Online parameter minus nominal | Fault size maps to a physical parameter | Slow faults, needs excitation |
| PCA or PLS | Projection outside a learned healthy subspace | Handles many correlated variables | Linear latent structure; diagnosis is not physical |
| Autoencoder or sequence model | Reconstruction or prediction error | Learns nonlinear temporal normality | Data hunger, calibration, no guarantees outside training support |

First surprise: the categories aren't as separate as their names. PCA learns an empirical residual space; parity methods derive one from equations. Observer and parity generators transform into each other under aligned objectives. A recent survey of stochastic model-based diagnosis still organises the whole field around parity space, observers and parameter estimation, with particle filters bolted onto the observer branch. See [Model-based fault diagnosis methods for systems with stochastic process](https://www.sciencedirect.com/science/article/pii/S0925231222012255).

Second surprise: where this student implementation is actually weak. Not the ARRs. The jump from four continuous signals to a decision: one fixed threshold per residual, and a flag raised when the mean of that residual over the tail of the run exceeds it. Maximally inspectable, which I like. Also calibrated on one healthy trajectory, collapses every temporal shape into a mean, assumes the operating regime never changes, and carries a zero threshold that only survives because the simulated pump is perfect.

A modern version doesn't throw away the four ARRs. Why would you? They're correct. It improves how they're judged:

a. Estimate \(p(r\mid\text{healthy},z)\) conditioned on the operating point \(z\), then threshold a normalised likelihood instead of a raw magnitude.

b. Feed short residual windows to a lightweight temporal classifier that keeps onset order and oscillation shape.

c. Replace raw differentiation with an observer or Kalman innovation, or the windowed integral above.

d. Learn only the unmodelled correction \(\Delta Q\) (valve hysteresis, pump drift) and keep conservation of mass as a hard constraint.

e. Reject patterns outside the known fault set instead of forcing a match.

That last hybrid has a fashionable name now, physics-informed machine learning. Most of what ships under that banner is a neural network with a differential equation sprinkled on top for the investor deck. The real version is a decision: which parts do you learn because you honestly don't know them, and which parts stay hard constraints because you do. The survey [Physics-Informed Machine Learning: Problems, Methods and Applications](https://arxiv.org/abs/2211.08064) has a taxonomy that's actually usable.

For these tanks: keep the mass balances, they're free and they're true. Learn valve hysteresis, pump-gain drift and the residual covariance, because those you don't know. Asking a network to rediscover that water is conserved is spending data to buy an equation you already own. It's not sophisticated. It's expensive stupidity.

# What I'd build now

The 2023 version used late-window means and a deterministic lookup. If I moved this onto a physical bench tomorrow:

- Timestamp and resample every signal onto one clock before evaluating any ARR. Half the *faults* I've seen in logs were two sensors on two clocks.
- Windowed integrals or an observer for the balances. Never a raw finite difference.
- Pump saturation and valve hysteresis implemented explicitly inside the residual generators, not documented somewhere and forgotten.
- Residuals normalised by their healthy variance, so \(r_1\) and \(r_3\) can be compared like adults.
- Persistence counters. One sample over a line is noise, not a fault.
- Store the residual vector, the operating point and the diagnosis together, so you can recalibrate later instead of guessing.
- Compound faults on the test list. The signature matrix assumes one fault at a time, and reality has never signed that contract.
- *Detected* separated from *isolated*. Knowing something is wrong is worth a lot even when the label isn't.

The literature calls all of this model-based fault detection and isolation. ARRs are one route to a residual; observers, parity equations and parameter estimation are others. The skeleton is always the same: the plant produces measurements, the model produces expectations, and the difference is evidence. A tidy statement of the ARR framing is in [this diagnostic bond-graph paper](https://journals.sagepub.com/doi/pdf/10.1177/0959651818755292?download=true), which calls the numerical evaluation of an ARR a residual fault indicator. Same thing, bigger words.