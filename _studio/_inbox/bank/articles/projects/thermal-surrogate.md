"Un surrogate neuronal que aprende la física térmica de una sala de data center AI y la acelera 10.000x, para detectar defectos de commissioning en tiempo real."

Idea de proyecto de portfolio. **Target: rol de ML**, demostrando dominio de data centers. Hermana ML de [[hvac]] (que *controla* la sala con MPC) y [[atmos-1]] (que la *monitoriza* en producción). Este *aprende* su física. Los tres comparten el mismo sustrato físico — sala, calor, cooling — pero atacan capas distintas.

---

## El pitch (la visión completa, sin recortar)

**Thermal Commissioning Punch-List Generator.** No es un dashboard de PUE. Es un copiloto de commissioning térmico:

> "Dame el layout de la sala, la potencia por rack, la posición de CRAHs, tiles, contención y sensores. Yo simulo miles de escenarios, aprendo la física y te digo dónde va a fallar la sala antes de que falle."

No predice "temperatura mañana". Genera una **lista de defectos probables** con causa y acción. Ejemplo de output:

> **Rack B14** — Riesgo de inlet > límite en 30 min: **78%**. Causa probable: recirculación por fuga de contención. Evidencia: sensores B12–B16 suben con 9 min de retraso respecto a CRAH-03. Acción: cerrar fuga + aumentar tile open area fila B + reducir carga a 72%. Confianza: 0.84.

Suena a herramienta que un commissioning agent, un MEP contractor o un colocation operator usaría antes de aceptar una sala. No parece portfolio; parece producto.

### De dónde salió — el ranking original

Vino de un research de 10 digital twins industriales nicho para AI data centers. Materia prima pública real que lo hace viable: **IM3 Data Center Atlas** (ubicaciones/huellas), **NASA POWER** (clima por API), **WRI Aqueduct** (riesgo hídrico), **Google Cluster Data + Azure Public Dataset** (trazas de workload), **ORNL Frontier** (energía + calor residual), **Overture/Microsoft** (huellas de edificios), **LBNL FDD** (fallos HVAC etiquetados), **OpenFOAM/OpenDSS** (datos sintéticos físicos). Los otros 9 (dew-point liquid cooling, rack placement optimizer, waste-heat offtake, smoke-ingestion, heatwave derating, substation interconnection, water-permit sim, FPT anomaly classifier, workload-to-heat scheduler) quedan como cantera de v2/spin-offs.

---

## El refinamiento clave (aquí está el jugo)

El pitch original es una **visión de producto disfrazada de portfolio** — un campo de minas para el patrón análisis-vs-acción. FNO + GNN + Bayesian Opt + OpenFOAM + C++ + Three.js es equipo de 4 personas / un año. Para una persona sola, cada capa es una excusa para no shippear. Se corta.

**La historia de ML de verdad, que es la buena:** un **surrogate neuronal** (neural operator / FNO / DeepONet / U-Net 3D) que aproxima un solver físico caro a ~10.000x velocidad con error medible. Eso es SciML / operator learning — calentísimo, honesto, benchmarkable, contratable. Tesis técnica real (por qué un operator generaliza sobre geometrías), no "hice un dashboard".

### La consecuencia que nadie ve

Si tu ML **es** acelerar la simulación → la simulación es tu **ground truth**, tu training data. Eso **sube** el listón de la física, no lo baja. Un surrogate solo es tan bueno como la verdad que imita: CFD malo → red que reproduce física falsa muy rápido y con confianza. Un entrevistador de ML hace dos preguntas y no hay tercera:

1. **¿Cuál es tu ground truth y por qué es válido?**
2. **¿Cuál es tu speedup Y tu error contra ese ground truth?**

Con esas dos respuestas sólidas, contratado.

### El nudo central del proyecto (la decisión que lo define)

Lo que hace legítimo el ML es justo lo que hace difícil la simulación:

- **Solver simple** (advección-difusión) → corre en tiempo real *ya* → ¿para qué aceleras algo instantáneo? El motivo del ML se evapora.
- **CFD de verdad** (Navier-Stokes / OpenFOAM) → minutos-horas por escenario → surrogate de ms es oro. Pero duro de validar, caro de generar, exige dominio.

No puedes tener el speedup impresionante con el solver fácil. **Ese es el trade-off que define el proyecto.**

**Zona dulce:** CFD de fidelidad media — RANS steady-state en malla gruesa, o lattice-Boltzmann — **1-5 min/escenario**. Lento suficiente para que acelerar sea historia real (10.000x = tu titular), validable contra hot-aisle/cold-aisle benchmarks publicados, parametrizable para generar el dataset.

**Pipeline limpio:** generas N escenarios con el CFD (offline, lento) → entrenas FNO/U-Net → inferencia en ms → esa es la demo interactiva en browser. El solver caro corre **una vez** para el dataset; la red es la que vive en la app.

---

## Qué mira de verdad un rol de ML (no la sala bonita)

| Qué | Por qué |
|---|---|
| **Benchmark solver vs surrogate** | speedup + error en una tabla. Tu portada. |
| **Test de generalización** | ¿funciona en configs de sala que la red NUNCA vio? Separa ML maduro de overfitting. |
| **Análisis de fallo** | dónde se rompe el surrogate. Saberlo *es* la señal de seniority. |
| **Ablations** | ¿por qué FNO y no una CNN normal? Que tengas la respuesta. |

## Cómo demostrar que "controlo data centers" sin fingir

Para un rol de ML el dominio es *sabor*, no el examen — pero es lo que diferencia. Se enseña en el **setup físico**, no en un CV de commissioning que no tengo: cargas térmicas realistas, hot/cold aisle, contención, límites **ASHRAE** citados, escenarios que un operador reconocería. Eso dice *"entiendo el sistema"* — legítimo para un ingeniero industrial — sin fingir *"he puesto salas en marcha"*. (Autoridad real de dominio propio = AI-en-salud / F29; aquí el data center es vertical elegido, no foso preexistente. Tenerlo presente.)

---

## v1 honesto (2-3 semanas, shippea)

Sala 3D interactiva en browser + solver + surrogate + overlay de riesgo por rack + botón "generar punch list". Sliders de carga/caudal/setpoint → la sala se calienta en tiempo real. Activar "puerta abierta" → recirculación en rojo. FNO/GNN/OpenFOAM completos son **v2, solo si** el solver medio está validado y sobra tiempo. Nunca al revés.

## Stack

Física: solver finite-volume (Python/JAX) para el dataset, CFD medio (RANS/LBM u OpenFOAM) como ground truth. ML: PyTorch, PyTorch Geometric, neural operators. Backend: FastAPI, DuckDB, Parquet. Viz 3D: Three.js, WebGL, shaders volumétricos; deck.gl/MapLibre si hay capa geoespacial.

## Qué NO hacer

No empezar por predicción de PUE, fallos de UPS, outages genéricos ni "mapa de data centers con clima" — obvio o depende de datos privados. No construir el monstruo full-stack de golpe. No fingir CFD de alta fidelidad que no puedo validar: mata la credibilidad con el único público que importa.

---

## Estado

Idea capturada (2026-07-04, tras sesión de sparring). **Pendiente:** decidir solver concreto de fidelidad media + diseñar pipeline de dataset. Ahí el proyecto se vuelve real o se queda en PowerPoint. Relacionados: [[hvac]] · [[atmos-1]] · [[infraprobe]].

> **Bifurcación (2026-07-05):** el camino **solver-simple + viz interactiva SIN ML** (advección-difusión 2D one-shoteable con Fable, datos abiertos, ground truth propio) se separó a [[hvac]] como proyecto por derecho propio — es el que se construye ahora. `thermal-surrogate` queda como la **hermana ML pura (v2)**: FNO/DeepONet sobre CFD de fidelidad media, solo cuando haya semanas para generar y validar el ground truth a mano. Su valor es justo lo que NO se one-shotea.
