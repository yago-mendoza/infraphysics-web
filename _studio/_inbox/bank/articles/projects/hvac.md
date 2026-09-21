# Un simulador térmico interactivo de sala de data center que se VE y se CALCULA — advección-difusión 2D por diferencias finitas + control PID/LQR/MPC, alimentado por datos abiertos, con el ground truth en TUS manos para que ninguna conclusión pueda decepcionar.

## El proyecto — refinamiento 2026-07-05 (lo que se construye de verdad)

Sesión de sparring cerrando cuatro requisitos a la vez: **one-shot con Fable + quiero VER la simulación + calcular/aproximar cosas serias + datos abiertos + que no acabe en conclusión ni datos de mierda.** El resultado no es el `hvac` puro ni `thermal-surrogate` puro: es la fusión sin la trampa del CFD.

### Qué es
Una **sala de data center en el navegador que simulas en tiempo real**:
- Grid 2D de la sala. Racks = fuentes de calor. CRAHs = frío. El aire mueve el calor (advección).
- Sliders: carga por rack, potencia de cooling, apertura de tiles, setpoint, temperatura exterior.
- **Se ve**: heatmap de la sala evolucionando. Abres "fuga de contención" → la recirculación florece en rojo. Subes la carga → el pasillo caliente se dispara.
- **Calcula de verdad**: temperatura por rack, PUE estimado, energía consumida, violaciones de límite ASHRAE, margen térmico.
- Encima, la **capa de control** (el núcleo original de esta nota): PID vs LQR vs MPC gobernando el cooling → *"MPC ahorró 18% de energía vs PID con cero violaciones en el workload simulado"*.

### La decisión que lo blinda: dueño del ground truth
El miedo real era *"¿y si las conclusiones o los datos son basura y me decepciona?"*. La respuesta que define el proyecto: **un simulador es un mundo cerrado del que TÚ posees la verdad.** No apuestas el valor a datos reales sucios que quizá no cooperen. Defines la física, inyectas los fallos, todo es medible contra una verdad que controlas. Por eso es el camino de **menor decepción**, no mayor:
- MPC vs PID es apples-to-apples **por construcción**.
- La recirculación al fallar la contención es **física visiblemente correcta**, no un claim que un dato pueda falsear.
- El "whoa" es el **visual interactivo en vivo**, no un titular estadístico frágil.

### Las ecuaciones (la "aproximación" que pedías)
- **SÍ hay PDE, pero la domable**: ecuación de **advección-difusión 2D resuelta por diferencias finitas** sobre la malla de la sala. Ese esquema de discretización ES tu cálculo/aproximación y es lo que genera el heatmap. Fable lo one-shotea (solver clásico ~200 líneas numpy/JS + canvas).
- Numérica real a la vista: **condición CFL** (el paso de tiempo lo limita `dx²/α`; si te pasas, explota), convergencia de malla. Eso separa ingeniería de juguete.
- **NO hay CFD** (Navier-Stokes turbulento / OpenFOAM). Eso es `thermal-surrogate` y es lo único que NO se one-shotea — su valor es un ground truth que no puedes validar solo.

### Datos abiertos (la física la simulas tú; los inputs son reales)
- **NASA POWER** (API) → temperatura exterior real por ubicación → condición de contorno.
- **ASHRAE TC 9.9 / 90.4** → límites térmicos citados (inlet 18–27 °C) → realismo + credibilidad.
- **IM3 Data Center Atlas** → ubicaciones/huellas reales si quieres anclar geometría.
- **Google Cluster Data / Azure Public Dataset** → trazas reales de workload → carga térmica variable de racks en vez de números inventados.

### El único riesgo real: "juguete bonito" — y cómo se mata
No es "datos malos", es que un lead de ML diga *"chulo, pero malla gruesa no es CFD, ¿qué demuestra?"*. Se mata con cuatro cosas:
1. **Validar contra un caso hot-aisle/cold-aisle publicado** → física defendible, no inventada.
2. **Numérica visible** (CFL, convergencia, esquema).
3. **Control no trivial** (MPC con restricciones y horizonte, no un if-else).
4. **Honestidad de scope como madurez**: "modelo de fidelidad media validado contra X, no una sala real" → suma credibilidad.

### El claim blindado (verdadero por construcción)
> *"Construí una sala de data center interactiva donde ves formarse la recirculación cuando falla la contención, y un MPC que respeta demostrablemente los límites térmicos en el simulador — validado contra un caso hot/cold-aisle publicado."*

No hay dato que lo tumbe. El 18% pasa a ser *"en este workload simulado, bajo estos supuestos"* — defendible al 100%.

### Capa tesis opcional (guarnición, no plato)
Encima del simulador, un agente que **lee el estado de la sala y escupe la punch-list** (*"Rack B14, riesgo inlet en 30 min, causa recirculación, acción cerrar fuga"*) → conserva el hook del verificador/eval sin ser el centro. Ver [[atmos-1]] (monitoriza en prod), [[60 - Proyecto]] (la capa de eval como tesis), [[leadrank]] (Cpk para agentes).

### Honestidad sobre el trade-off
Increíble + whoa + original + cero-decepción **no se maximizan los cuatro a la vez**. Esta es la versión con ~90% del whoa y ~95% de la seguridad. No es el máximo de "original" (existe CFD comercial tipo 6SigmaDCX), pero el ángulo sí lo es: browser + tiempo real + control-lab comparado + datos abiertos + capa de verificación. Nadie junta eso.

Hermanas: [[thermal-surrogate]] (la ML pura — v2, cuando quieras invertir semanas a mano en CFD) · [[atmos-1]] (la que monitoriza en producción).

---

## Origen — sparring inicial (MPC control lab)

“Model Predictive Control para controlar temperatura y consumo energético en un sistema HVAC / datacenter cooling simulado.”

Esto encaja contigo: industrial, energía, datacenters, sistemas físicos, IA aplicada, control serio.

Qué problema resuelve

Tienes una sala con servidores que generan calor. Puedes controlar ventiladores o cooling power. Quieres mantener la temperatura dentro de límites seguros, pero gastando la mínima energía posible.

Problema real:

mantener temperatura segura + minimizar energía + respetar restricciones.

Eso es exactamente territorio MPC.

Qué construiría

Nombre del repo:

mpc-energy-control-lab

El sistema tendría:

1. Modelo dinámico térmico

Algo simple pero serio:

T_next = T + Δt * (heat_load - cooling_power - losses) / thermal_mass

Variables:

temperatura de sala;
carga térmica de servidores;
temperatura exterior;
potencia de cooling;
límite máximo de temperatura;
coste energético;
quizá precio eléctrico variable.

2. Controladores comparados

Esto es importante. No pongas solo MPC. Compara:

PID vs LQR vs MPC

Así demuestras criterio.

PID: baseline industrial clásico.
LQR: control óptimo lineal.
MPC: control predictivo con restricciones.

MIT Underactuated explica muy bien la lógica de LQR y por qué sirve como política local óptima alrededor de un punto o trayectoria; también muestra que para sistemas más complejos entran trajectory optimization y MPC.

3. Restricciones reales

Aquí está el valor. El MPC debe respetar:

temperatura máxima: por ejemplo, T < 27 ºC;
cooling power máximo;
cambios suaves de control;
evitar encender/apagar agresivamente;
coste energético variable por hora.

4. Optimización con CasADi o do-mpc

Usaría CasADi o do-mpc. CasADi está pensado para optimización numérica y control óptimo, incluyendo NMPC; do-mpc es una toolbox Python open-source para robust MPC y moving horizon estimation.

5. Simulación con perturbaciones

No hagas una simulación limpia. Mete:

subida brusca de carga térmica;
fallo parcial del cooling;
temperatura exterior cambiante;
ruido en sensores;
delay de actuación.

Eso parece empresa.

6. Dashboard o vídeo

Una demo visual con gráficas:

temperatura;
límite máximo;
cooling power;
coste acumulado;
comparación PID/LQR/MPC;
momentos donde entra una perturbación.
Qué métricas pondría

No pondría solo “funciona”. Pondría:

energy saved vs PID,
time above temperature limit,
control smoothness,
constraint violations,
response time to disturbance,
total cost.

Ejemplo de claim bueno:

“MPC reduced energy usage by 18% compared with PID while keeping temperature constraint violations at zero in the simulated workload scenario.”

Aunque sea simulado, suena a ingeniería real.

Por qué este proyecto es bueno

Porque enseña tres cosas a la vez:

control, optimización y sistemas industriales.

Y además no parece un juguete. Una empresa de datacenters, energía, HVAC, automatización, manufacturing o infra física entiende el problema inmediatamente.

Tiempo

Con 5 h/día:

2 semanas: modelo térmico + PID.
1 mes: LQR + MPC básico.
2 meses: simulación seria con restricciones y perturbaciones.
3 meses: proyecto muy presentable con dashboard, informe y comparación.

Pero para aprender LQR/MPC, haría antes un mini-proyecto

Antes del proyecto de cooling, haría durante 1-2 semanas:

inverted-pendulum-control

Péndulo invertido con:

PID;
LQR;
MPC;
perturbaciones;
vídeo de la simulación.

Gymnasium/MuJoCo ya tiene entornos de péndulo invertido donde el objetivo es mantener el péndulo en vertical dentro de un límite angular.

Pero esto sería proyecto de aprendizaje, no el proyecto estrella.