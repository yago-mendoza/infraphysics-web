Headless device
# Introduction
A computational unit (laptop) lacking [[UI//GUI]]. No display subsystem, no icons, no windows. Interface limited to command line (pure input/output via keyboard and ASCII code).
`some code`
---
LAPTOP//UI
Interface channel linking human intent to machine response (voice, neural, gesture, ...).
[[UI//GUI]]
---
IPAD//UI
...
[[LAPTOP//UI]]
---
UI//GUI
[[LAPTOP//UI]] subtype.
Fancy front-end for your bits.
---
IPAD
A device.
---
MEDIA//IMAGE ALIGNMENT
Images can be positioned in notes.
![code on screen](https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=400&auto=format&fit=crop "right:200px")
This text flows alongside the image on the right. Useful for annotating diagrams or referencing visual material inline.
---
compiler
The build-time system that transforms raw markdown into rendered HTML. Runs headlessly via Node.js — no [[UI//GUI]] involved. The pipeline is: pre-processors, side-image layout, marked.parse, post-processors, wiki-link injection.
[[compiler//pre-processor]]
[[compiler//post-processor]]
[[compiler//pipeline]]
---
compiler//pipeline
The ordered sequence of transformations applied to each markdown file. Custom syntax is resolved {_:before} marked runs, so HTML spans survive the markdown parser. Wiki-links are injected {_:after} all HTML is generated.
[[compiler//pre-processor]]
[[compiler//post-processor]]
[[compiler]]
---
compiler//pre-processor
A transformation rule applied to raw markdown {_:before} marked.parse. Each rule is a regex pattern with a replacement string. Pre-processors handle custom syntax like colored text, underlines, highlights, superscripts, subscripts, and keyboard keys.
[[compiler//pipeline]]
[[compiler]]
---
compiler//post-processor
A transformation rule applied to HTML {_:after} marked.parse. Currently unused but extensible — add entries to the postProcessors array in compiler.config.js.
[[compiler//pipeline]]
[[compiler]]
---
compiler//custom syntax
Inline formatting extensions beyond standard markdown. Defined as pre-processor rules in compiler.config.js. Includes: colored text, solid/dashed/dotted/wavy underlines, highlights, small caps, superscript, subscript, keyboard keys.
[[compiler//pre-processor]]
[[compiler]]
---
ARM
A reduced instruction set computing (RISC) architecture licensed by Arm Holdings. Dominates mobile, embedded, and increasingly server workloads due to power efficiency. Unlike x86, ARM licenses its instruction set to third parties — [[chip//SoC]] vendors like Apple, Qualcomm, and Samsung design their own cores around it. Three main profile families target different compute tiers.
[[ARM//cortex-A]]
[[ARM//cortex-R]]
[[ARM//cortex-M]]
---
CPU
The central processing unit — the sequential instruction executor at the heart of every programmable system. Fetches, decodes, and executes one instruction stream per [[CPU//core]]. Arithmetic happens in the [[CPU//ALU]], operands live in [[CPU//register]] files, and shared-state coordination requires [[CPU//mutex]] primitives. In embedded contexts, the CPU is often an ARM core inside a [[chip//MCU]] or [[chip//SoC]].
[[CPU//ALU]]
[[CPU//register]]
[[CPU//core]]
[[CPU//mutex]]
---
RAM
Random-access memory — volatile storage providing nanosecond-latency read/write for running programs. The operating system partitions physical RAM into [[RAM//kernel space]] (privileged, hardware-facing) and [[RAM//user space]] (application sandboxes). RAM bandwidth and latency dominate performance in data-intensive tasks — [[GPU//architecture]] addresses this with wide buses and high-bandwidth memory. Embedded systems often use SRAM on-chip inside a [[chip//MCU]].
[[RAM//kernel space]]
[[RAM//user space]]
---
GPU
A massively parallel processor optimized for throughput over latency. Thousands of simple cores execute the same instruction on different data (SIMD/SIMT). Originally designed for rendering, now critical for [[ML]] training and inference. Available as [[GPU//discrete]] add-in cards or [[GPU//integrated]] units sharing the [[chip//SoC]] die with the [[CPU]].
[[GPU//architecture]]
[[GPU//integrated]]
[[GPU//discrete]]
---
sensor
A device that converts a physical quantity (temperature, acceleration, light, pressure) into an electrical signal. Raw analog output is digitized by an ADC for processing. A [[sensor//smart sensor]] integrates signal conditioning and a local processor on one die. Sensors feed data to [[chip//MCU]] or [[chip//SoC]] platforms in IoT and industrial systems, and often connect via [[I/O//MMIO]] or serial buses.
[[sensor//smart sensor]]
---
ASIC
Application-specific integrated circuit — a chip designed for exactly one task. Unlike a general-purpose [[CPU]] or programmable [[chip//MCU]], an ASIC's logic is frozen at [[manufacturing//fab]] time. Delivers maximum throughput per watt for fixed workloads: Bitcoin mining, video encoding, network packet processing. [[ML//TPU]] is a category of ML-focused ASIC. Design cost is high, so ASICs only make sense at volume.
[[chip//SoC]]
[[manufacturing//fab]]
[[ML//TPU]]
[[CPU]]
[[chip//MCU]]
---
ML
Machine learning — algorithms that improve through data rather than explicit programming. Training runs on [[GPU]] clusters or [[ML//TPU]] accelerators; inference can happen on cloud GPUs, edge [[ML//NPU]] cores, or even [[chip//MCU]] devices via [[ML//TinyML]]. The boundary between software and hardware blurs as ML models get baked into silicon.
[[ML//TinyML]]
[[ML//NPU]]
[[ML//TPU]]
---
manufacturing
The physical processes that turn a chip design into a packaged, testable product. Spans wafer [[manufacturing//fab]] (lithography, etching, doping), [[manufacturing//PCB]] assembly (soldering components onto boards), and [[manufacturing//firmware]] flashing (writing initial software into non-volatile memory). Each stage introduces yield and reliability constraints.
[[manufacturing//PCB]]
[[manufacturing//firmware]]
[[manufacturing//fab]]
---
I/O
Input/output — the mechanisms through which a [[CPU]] communicates with the external world: storage, network, sensors, displays. Software triggers I/O via [[I/O//syscall]] (user-to-kernel boundary), while hardware uses [[I/O//MMIO]] (memory-mapped registers) or [[I/O//DMA]] (direct memory access bypassing the CPU). I/O latency often dominates real-world performance far more than raw compute speed.
[[I/O//syscall]]
[[I/O//MMIO]]
[[I/O//DMA]]
---
chip
A monolithic piece of silicon carrying integrated circuits. Categories include [[chip//MCU]] (microcontroller — CPU + memory + peripherals), [[chip//MPU]] (microprocessor — CPU only, needs external memory), and [[chip//SoC]] (system-on-chip — heterogeneous integration of CPU, GPU, NPU, modems). The line between them blurs as integration density rises with each [[manufacturing//fab]] node shrink.
[[chip//MCU]]
[[chip//MPU]]
[[chip//SoC]]
---
peripheral
An external or on-chip hardware block that extends a processor's capabilities — timers, UARTs, SPI, I2C, ADC, DAC, PWM controllers. In embedded development, peripherals are the interface between digital logic and the physical world. Popular development platforms like [[peripheral//STM32]] and [[peripheral//ESP32]] provide rich peripheral sets accessible via [[I/O//MMIO]] registers.
[[peripheral//STM32]]
[[peripheral//ESP32]]
---
CPU//ALU
The arithmetic logic unit — the combinational circuit inside a [[CPU//core]] that performs integer addition, subtraction, bitwise AND/OR/XOR, and shifts. Floating-point math typically lives in a separate FPU. Modern cores have multiple ALUs executing in parallel, fed by the out-of-order scheduler. The ALU's result is written back to a [[CPU//register]].
[[CPU//core]]
[[CPU//register]]
[[CPU]]
---
CPU//register
A small, ultra-fast storage cell inside the [[CPU//core]] — typically 32 or 64 bits wide. Registers hold operands for the [[CPU//ALU]], return addresses, stack pointers, and status flags. ARM architectures expose 16–31 general-purpose registers; x86 has historically fewer, relying more on stack and memory. Register pressure directly affects compiler optimization quality.
[[CPU//ALU]]
[[CPU//core]]
[[CPU]]
---
CPU//core
A single, independent instruction execution pipeline within a [[CPU]]. Modern processors pack 4–128+ cores onto one die, each with private L1/L2 caches and shared L3. Multi-core scaling requires careful synchronization via [[CPU//mutex]] primitives to avoid data races. ARM big.LITTLE pairs high-performance [[ARM//cortex-A]] cores with efficient ones for power-aware scheduling.
[[CPU]]
[[CPU//mutex]]
[[ARM//cortex-A]]
---
CPU//mutex
A mutual exclusion primitive — a lock that serializes access to shared [[RAM]] regions across [[CPU//core]] boundaries. Spinlocks, semaphores, and read-write locks are common variants. Contention on hot mutexes is a top scalability bottleneck. Language runtimes sometimes enforce broader exclusion: Python's [[CPU//mutex//GIL]] or JavaScript's [[CPU//mutex//event loop]] sidestep data races by constraining concurrency at the language level.
[[CPU//core]]
[[RAM]]
[[CPU//mutex//GIL]]
[[CPU//mutex//event loop]]
---
RAM//kernel space
The protected region of [[RAM]] reserved for the operating system kernel, device drivers, and interrupt handlers. User programs cannot access kernel memory directly — they cross the boundary via [[I/O//syscall]]. Kernel space has full hardware access, including [[I/O//MMIO]] registers and [[I/O//DMA]] descriptors. A fault here crashes the entire system.
[[RAM]]
[[I/O//syscall]]
[[I/O//MMIO]]
---
RAM//user space
The unprivileged region of [[RAM]] where application processes live. Each process sees a virtual address space isolated by the MMU. Communication with hardware or kernel services requires a [[I/O//syscall]], which context-switches into [[RAM//kernel space]]. Memory allocation (malloc, mmap) operates within user space pages managed by the kernel.
[[RAM]]
[[I/O//syscall]]
[[RAM//kernel space]]
---
GPU//architecture
The internal design of a [[GPU]] — thousands of streaming multiprocessors (NVIDIA) or compute units (AMD) grouped into warps/wavefronts that execute in lockstep. Memory hierarchy includes registers, shared memory, L1/L2 caches, and high-bandwidth GDDR or HBM. Architecture choices determine throughput for graphics, [[ML]] training, and scientific workloads. [[GPU//discrete]] cards push bleeding-edge architectures; [[GPU//integrated]] units share die area with the [[CPU]].
[[GPU]]
[[GPU//discrete]]
[[GPU//integrated]]
[[ML]]
---
GPU//integrated
A [[GPU]] core embedded on the same die (or package) as the [[CPU]], sharing system [[RAM]] instead of dedicated VRAM. Found in every laptop APU, mobile [[chip//SoC]], and Apple Silicon. Lower power and bandwidth than [[GPU//discrete]], but zero-copy data sharing with the CPU simplifies programming and cuts latency for lightweight graphics and [[ML//NPU]]-style inference tasks.
[[GPU]]
[[CPU]]
[[chip//SoC]]
[[GPU//discrete]]
---
GPU//discrete
A standalone [[GPU]] on its own PCB with dedicated GDDR/HBM memory, connected to the host [[CPU]] via PCIe or NVLink. Delivers maximum compute throughput for [[ML]] training, rendering, and HPC. Power draw ranges from 75W (entry) to 700W+ (datacenter). Data must be explicitly transferred between host [[RAM]] and device memory, adding latency but offering massive bandwidth on-card.
[[GPU]]
[[CPU]]
[[RAM]]
[[ML]]
---
I/O//syscall
A system call — the controlled gate between [[RAM//user space]] and [[RAM//kernel space]]. When a process needs hardware access (read file, send packet, allocate memory), it traps into the kernel via a syscall instruction. The kernel validates arguments, performs the operation, and returns. Syscall overhead (context switch + TLB flush) motivates batching APIs (io_uring, sendmmsg) and [[I/O//DMA]] for bulk transfers.
[[RAM//user space]]
[[RAM//kernel space]]
[[I/O//DMA]]
---
I/O//MMIO
Memory-mapped I/O — hardware registers mapped into the [[CPU]]'s address space so they look like ordinary [[RAM]] locations. A write to address 0x4000_1000 might toggle a GPIO pin; a read from 0x4001_0004 might fetch an ADC sample. [[chip//MCU]] programming is largely MMIO: [[peripheral//STM32]] and [[peripheral//ESP32]] SDKs provide register-level abstractions over MMIO addresses.
[[CPU]]
[[RAM]]
[[chip//MCU]]
[[peripheral//STM32]]
---
I/O//DMA
Direct memory access — a hardware engine that copies data between [[RAM]] and peripherals without [[CPU]] intervention. The CPU programs source/dest addresses and length, then the DMA controller handles the transfer while the CPU does other work. Critical for high-throughput I/O: disk, network, audio, and [[GPU//discrete]] PCIe transfers. Embedded [[chip//MCU]] DMA channels service ADC, SPI, and UART buffers.
[[RAM]]
[[CPU]]
[[chip//MCU]]
[[GPU//discrete]]
---
chip//MCU
Microcontroller unit — a self-contained [[chip]] integrating a [[CPU//core]] (often ARM Cortex-M), flash memory, [[RAM]], and [[peripheral]] blocks (timers, ADC, UART, SPI, I2C) on a single die. Runs bare-metal or RTOS code. Examples: [[peripheral//STM32]] (STMicro), [[peripheral//ESP32]] (Espressif). MCUs dominate IoT, automotive, and industrial control where cost, power, and determinism matter more than raw speed.
[[chip]]
[[CPU//core]]
[[ARM//cortex-M]]
[[peripheral//STM32]]
[[peripheral//ESP32]]
[[manufacturing//firmware]]
---
chip//MPU
Microprocessor unit — a [[chip]] containing only the [[CPU//core]] (and caches), requiring external [[RAM]], storage, and peripheral chips on the [[manufacturing//PCB]]. Desktop and server processors (Intel Core, AMD Ryzen, Apple M-series) are MPUs, though modern ones are blurring into [[chip//SoC]] territory by integrating GPU, NPU, and memory controllers on-package.
[[chip]]
[[CPU//core]]
[[RAM]]
[[manufacturing//PCB]]
[[chip//SoC]]
---
chip//SoC
System-on-chip — a [[chip]] integrating [[CPU//core]] clusters, [[GPU]], [[ML//NPU]], memory controller, modem, and [[peripheral]] blocks onto a single die or package. Examples: Apple M-series, Qualcomm Snapdragon, NVIDIA Orin. SoCs dominate mobile and edge computing because tight integration reduces latency, power, and board area vs. discrete [[chip//MPU]] + [[GPU//discrete]] designs.
[[chip]]
[[CPU//core]]
[[GPU]]
[[ML//NPU]]
[[chip//MPU]]
[[GPU//discrete]]
---
ARM//cortex-A
ARM's application-profile [[CPU//core]] family — designed for high-performance workloads running full operating systems (Linux, Android, iOS). Found in smartphones, tablets, laptops (Apple M-series), and cloud servers (AWS Graviton). Features out-of-order execution, virtual memory, and multi-level caches. Pairs with [[GPU//integrated]] and [[ML//NPU]] blocks inside a [[chip//SoC]].
[[CPU//core]]
[[chip//SoC]]
[[GPU//integrated]]
[[ML//NPU]]
---
ARM//cortex-R
ARM's real-time profile [[CPU//core]] family — deterministic, low-latency execution for safety-critical systems. Found in automotive ECUs (braking, airbags), hard-drive controllers, and baseband modems. Features tightly-coupled memory, dual-core lockstep (fault detection), and fast interrupt response. Runs bare-metal or RTOS, not Linux. Bridges the gap between [[ARM//cortex-M]] and [[ARM//cortex-A]].
[[CPU//core]]
[[ARM//cortex-M]]
[[ARM//cortex-A]]
---
ARM//cortex-M
ARM's microcontroller profile [[CPU//core]] family — optimized for low power, low cost, and deterministic real-time behavior. The heart of most modern [[chip//MCU]] devices. Variants range from Cortex-M0 (tiny, 12K gates) to Cortex-M55 (with Helium vector extensions for [[ML//TinyML]]). Executes Thumb-2 instructions, has a nested vectored interrupt controller (NVIC), and runs bare-metal or RTOS.
[[CPU//core]]
[[chip//MCU]]
[[ML//TinyML]]
---
sensor//smart sensor
A [[sensor]] with on-board signal conditioning, ADC, and a small processor (often [[ARM//cortex-M]]) integrated on the same die or package. Outputs calibrated digital data over I2C/SPI instead of raw analog voltage. Examples: MEMS accelerometers (Bosch BMA400), environmental sensors (BME680). Offloads filtering and fusion from the host [[chip//MCU]], reducing [[I/O]] traffic and [[CPU]] load.
[[sensor]]
[[ARM//cortex-M]]
[[chip//MCU]]
---
ML//TinyML
Machine learning inference on microcontrollers ([[chip//MCU]]) and ultra-low-power devices — models measured in kilobytes, running on [[ARM//cortex-M]] cores with sub-milliwatt budgets. Frameworks: TensorFlow Lite Micro, Edge Impulse. Use cases: keyword spotting, anomaly detection, gesture recognition. Bypasses cloud latency and connectivity requirements by keeping data and inference entirely on-device.
[[chip//MCU]]
[[ARM//cortex-M]]
[[ML]]
[[sensor//smart sensor]]
---
ML//NPU
Neural processing unit — a dedicated accelerator for [[ML]] inference workloads, optimized for matrix multiply-accumulate operations at low precision (INT8, FP16). Found inside modern [[chip//SoC]] designs (Apple Neural Engine, Qualcomm Hexagon, Google Tensor). Offloads inference from the [[CPU]] and [[GPU]], achieving higher throughput per watt. Programmable via frameworks like Core ML, NNAPI, or ONNX Runtime.
[[ML]]
[[chip//SoC]]
[[CPU]]
[[GPU]]
---
ML//TPU
Tensor processing unit — Google's custom [[ASIC]] designed for [[ML]] training and inference at datacenter scale. Uses a systolic array architecture to stream matrix operations with minimal memory access. TPU v4 pods interconnect thousands of chips via custom high-bandwidth networks. Exposed as cloud instances (Google Cloud TPU). Represents the extreme end of ML hardware specialization.
[[ASIC]]
[[ML]]
---
peripheral//STM32
STMicroelectronics' family of [[ARM//cortex-M]] (and Cortex-A) based [[chip//MCU]] and [[chip//MPU]] devices. The STM32F4 and STM32H7 series are workhorses for embedded development — rich [[peripheral]] sets (ADC, DAC, timers, CAN, USB, Ethernet), mature tooling (STM32CubeMX, HAL drivers), and a massive community. [[manufacturing//firmware]] is typically C, compiled with GCC-ARM, and flashed via SWD/JTAG.
[[ARM//cortex-M]]
[[chip//MCU]]
[[peripheral]]
[[manufacturing//firmware]]
---
peripheral//ESP32
Espressif's Wi-Fi + Bluetooth [[chip//SoC]] family targeting IoT. Integrates dual-core [[CPU]] (Xtensa or RISC-V), [[RAM]], flash, radio, and [[peripheral]] blocks (ADC, SPI, I2C, PWM). Programmed via ESP-IDF (FreeRTOS-based) or Arduino. Popular for [[sensor//smart sensor]] gateways, home automation, and [[ML//TinyML]] edge devices. Low cost (~$2–5) makes it the default prototyping platform for connected hardware.
[[chip//SoC]]
[[CPU]]
[[peripheral]]
[[sensor//smart sensor]]
[[ML//TinyML]]
---
manufacturing//PCB
Printed circuit board — the fiberglass-and-copper substrate that mechanically supports and electrically connects [[chip]] components via etched traces. Design tools: KiCad, Altium. Manufacturing involves layer stackup, drilling, plating, solder mask, and silkscreen. A [[chip//MCU]] or [[chip//MPU]] sits on the PCB alongside passives (resistors, capacitors), connectors, and power regulation. Board complexity ranges from 2-layer hobbyist to 20+ layer server motherboards.
[[chip]]
[[chip//MCU]]
[[chip//MPU]]
---
manufacturing//firmware
The software permanently stored in a device's non-volatile memory (flash, EEPROM) — the first code that runs at power-on. For a [[chip//MCU]], firmware initializes clocks, configures [[peripheral]] registers via [[I/O//MMIO]], and enters the main application loop. Written in C/C++, compiled to ARM/RISC-V machine code, and flashed onto the device via SWD, JTAG, or USB bootloader. Over-the-air (OTA) updates allow field upgrades.
[[chip//MCU]]
[[peripheral]]
[[I/O//MMIO]]
---
manufacturing//fab
A semiconductor fabrication facility (foundry) that manufactures [[chip]] dies from silicon wafers. Process nodes (TSMC 3nm, Samsung 4nm, Intel 18A) define transistor density and power efficiency. Fabrication involves hundreds of lithography, etching, deposition, and doping steps. Foundries like TSMC produce [[ASIC]], [[chip//SoC]], [[CPU]], and [[GPU]] dies for fabless companies. Fab cost exceeds $20B for leading-edge nodes.
[[chip]]
[[ASIC]]
[[chip//SoC]]
[[CPU]]
[[GPU]]
---
CPU//mutex//GIL
The Global Interpreter Lock — Python's [[CPU//mutex]] that ensures only one thread executes Python bytecode at a time. Simplifies memory management (reference counting is thread-safe without fine-grained locks) but prevents true [[CPU//core]] parallelism for CPU-bound tasks. Workarounds: multiprocessing (separate processes), C extensions that release the GIL, or async I/O via the [[CPU//mutex//event loop]] for I/O-bound code. Python 3.13+ experiments with a free-threaded build (no-GIL mode).
[[CPU//mutex]]
[[CPU//core]]
[[CPU//mutex//event loop]]
---
CPU//mutex//event loop
A single-threaded concurrency model — one [[CPU//core]] runs a loop that dispatches callbacks when [[I/O]] operations complete, avoiding [[CPU//mutex]] contention entirely. JavaScript (Node.js, browsers), Python asyncio, and Rust's tokio all use this pattern. Non-blocking I/O calls (epoll, kqueue, IOCP) register interest, and the loop multiplexes thousands of concurrent connections without spawning threads. Ideal for I/O-bound workloads; CPU-bound tasks block the loop and must be offloaded.
[[CPU//core]]
[[I/O]]
[[CPU//mutex]]
[[CPU//mutex//GIL]]
---
SYNTAX REFERENCE
# Markdown estándar
Texto en **negrita**, *cursiva*, ***ambas***, y ~~tachado~~. Código en línea: `const x = 42`. _Subrayado_ reemplaza la cursiva de guiones bajos en este compilador — para cursiva se usa asterisco.
## Encabezados
De `#` (h1) a `######` (h6). Se renderizan en fuente monoespaciada con color de encabezado temático. El h1 lleva borde izquierdo con acento.
## Listas
Desordenada:
- Primer elemento
- Segundo elemento
- Tercer elemento

Ordenada:
1. Paso uno
2. Paso dos
3. Paso tres
## Cita
> Bloque de cita. Se renderiza con borde lateral y color secundario. Puede contener **negrita**, *cursiva*, `código` y [[compiler//custom syntax]] dentro.
## Tabla
| Tipo | Sintaxis | Resultado |
|------|----------|-----------|
| Negrita | doble asterisco | **demo** |
| Cursiva | asterisco simple | *demo* |
| Código | backticks | `demo` |
| Tachado | doble tilde | ~~demo~~ |
## Bloque de código
Bloques delimitados por triple backtick con lenguaje opcional para resaltado Shiki:
```typescript
const greet = (name: string): string => {
  return `Hello, ${name}!`;
};
```
## Enlace externo
Corchetes para texto, paréntesis para URL: [ejemplo](https://example.com). Renderiza en color de acento con subrayado al hover.
# Pre-procesadores
Sintaxis personalizada definida en `compiler.config.js`. Se resuelve _antes_ de que `marked` procese el markdown, por lo que los `<span>` resultantes sobreviven al parser.
## Color de texto
Llaves con almohadilla + nombre CSS o hex + dos puntos: {#red:rojo}, {#blue:azul}, {#22c55e:verde hex}, {#f59e0b:ámbar hex}, {#a78bfa:violeta hex}.
## Versalitas
Llaves con sc: {sc:texto en versalitas}. Útil para acrónimos estilizados.
## Superíndice
Llaves con caret: E = mc{^:2}, x{^:n+1}, nota{^:1}.
## Subíndice
Llaves con v: H{v:2}O, CO{v:2}, log{v:10}.
## Teclas
Llaves con kbd: {kbd:Ctrl+C} copiar, {kbd:Shift+Enter} nueva línea, {kbd:Alt+Tab} cambiar ventana. Renderiza como tecla con borde inferior.
## Subrayado
Guiones bajos en límites de palabra: _texto subrayado_. Solo se activa cuando los guiones no están pegados a otra palabra (para no interferir con nombres como `mi_variable`).
## Resaltado
Doble signo igual: ==texto resaltado==. Se convierte en `<mark>` con fondo amarillo del navegador.
## Texto acentuado
Doble guión: --texto con acento--. Aplica la clase `.accent-text` que toma el color de acento de la sección. Nota: el contenido no puede llevar guiones internos.
# Wiki-links
Doble corchete: [[compiler]]. Con jerarquía: [[compiler//custom syntax]]. Los links resueltos muestran un diamante (◇) y preview al hover. Los no resueltos muestran interrogación roja (?). Las referencias al final de una nota (sin texto alrededor) aparecen en la sección "Related" del detalle.
# Imágenes
Markdown estándar `![alt](url)` renderiza a ancho completo (máximo 450px de alto). El título entre comillas controla la posición: `"right:200px"` flota a la derecha con ancho máximo, `"left:200px"` flota a la izquierda, `"center"` centra como bloque, `"full"` fuerza ancho completo.
# Estructura de nota
Cada entrada en `_fieldnotes.md` sigue: título en primera línea (jerarquía con `//`), contenido en líneas siguientes, wiki-links sueltos al final como trailing refs, y `---` como separador. El título genera el `id` (slug URL) y el `address` (ruta jerárquica). Si el título tiene jerarquía (ej. `CPU//ALU`), el `displayTitle` muestra solo el último segmento.
[[compiler//custom syntax]]
[[compiler//pre-processor]]
[[compiler]]