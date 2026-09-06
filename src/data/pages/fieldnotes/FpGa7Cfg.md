---
uid: "FpGa7Cfg"
address: "Hardware//chip//FPGA"
name: "FPGA"
date: "2026-09-03"
---

Una **FPGA** (field-programmable gate array) es un chip cuya lógica y cuyas conexiones pueden configurarse después de fabricarlo. No ejecuta simplemente un programa sobre un datapath fijo: reorganiza bloques lógicos, registros, memorias y rutas de interconexión para que el propio chip adopte la forma del circuito requerido.

## Configuration memory

El tejido configurable combina LUTs (pequeñas tablas que implementan funciones lógicas), flip-flops, bloques de RAM, unidades DSP, pines de I/O y una red de routing programable. En muchas FPGA, millones de bits de SRAM determinan qué contiene cada LUT y qué entradas seleccionan los multiplexores, switch boxes y transistores de paso que conectan unos bloques con otros.

- Una conexión lógica no suele corresponder a un cable dedicado. La señal puede atravesar varios segmentos y switches configurables.
- La SRAM de configuración describe el circuito activo; no almacena normalmente los datos del workload.
- Como la SRAM es volátil, muchas FPGA cargan un bitstream desde memoria externa al arrancar. Otras familias utilizan flash o antifuse.
- Cambiar el bitstream permite reutilizar el mismo chip para representar otro circuito sin volver a fabricar silicio.

## Programmability overhead

La configurabilidad tiene un coste físico. La SRAM, los multiplexores, los switches y el routing general necesitan más transistores, ocupan más área, consumen energía y añaden resistencia y capacitancia. Una función implementada en FPGA suele trabajar a menor frecuencia y con menor eficiencia física que su equivalente en un [[6YzJQiig|ASIC]].

- **Área:** hacen falta más transistores para implementar la misma función lógica.
- **Retardo:** cada switch y segmento de routing alarga el camino de la señal.
- **Energía:** se conmuta y se carga más cableado, aunque sólo una parte realice trabajo útil.
- **Contrapartida:** este overhead está presente en cada unidad, pero permite cambiar el circuito sin pagar el enorme coste inicial de diseñar y fabricar otro chip.

Un ASIC también tiene propagación y retardo. La diferencia no es «FPGA con retardo, ASIC sin retardo», sino routing configurable con más indirección frente a conexiones optimizadas y fijadas directamente en silicio.

## Spatial dataflow

Una FPGA puede materializar las operaciones de un algoritmo en regiones distintas del hardware y hacer que los datos fluyan físicamente de una etapa a la siguiente. Mientras la etapa 3 procesa el dato A, la etapa 2 procesa B y la etapa 1 recibe C. Una vez lleno el pipeline, puede terminar un resultado por ciclo aunque cada dato tarde varios ciclos en recorrerlo completo.

Así se evita reutilizar constantemente una única maquinaria mediante fetch, decode y execute, como hace una [[OkJJJyxX|CPU]] de propósito general. El tiempo se convierte parcialmente en espacio: replicamos operaciones y etapas para ejecutarlas simultáneamente.

La memoria no desaparece. Registros, FIFOs, block RAM y buffers conservan el estado entre etapas y absorben diferencias de ritmo. Lo que puede reducirse es parte del tráfico de load/store y de la maquinaria de control general. Este patrón funciona especialmente bien con streams regulares; branching complejo, accesos irregulares o pipelines mal alimentados reducen la ventaja.

## Cuándo tiene sentido

Una FPGA resulta especialmente útil en procesamiento de señales y paquetes, vídeo, interfaces de alta velocidad, inferencia con precisión personalizada y sistemas que necesitan latencia determinista. Puede perder frente a CPU o [[WEUTQwqv|GPU]] cuando el workload cambia continuamente, depende de memoria irregular o no genera suficiente flujo para mantener ocupado el pipeline.

La imagen útil es un cauce configurable. Una CPU hace pasar operaciones distintas por una maquinaria general; una FPGA reorganiza parte de la maquinaria para que muchos datos atraviesen el mismo circuito en flujo continuo.

## Interactions

- [[OkJJJyxX|CPU]] : : La CPU configura una secuencia de instrucciones sobre hardware general; la FPGA configura parte del propio datapath
- [[WEUTQwqv|GPU]] : : La GPU ofrece paralelismo masivo sobre una arquitectura fija; la FPGA permite construir una arquitectura paralela específica
- [[6YzJQiig|ASIC]] : : Ambos pueden materializar un datapath especializado, pero el ASIC lo congela en silicio y elimina gran parte de la infraestructura reconfigurable
