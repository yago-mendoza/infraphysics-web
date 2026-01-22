import { Post } from './types';

export const bits2bricksPosts: Post[] = [
  {
    id: 'fpga-uart-controller',
    title: 'fpga-uart-controller',
    displayTitle: 'fpga uart controller',
    category: 'bits2bricks',
    date: '2023-12-05',
    thumbnail: 'https://images.unsplash.com/photo-1555664424-778a69631025?q=80&w=400&auto=format&fit=crop',
    description: 'verilog implementation of serial comms.',
    content: `
# fpga uart controller

bridging the gap between software (bits) and hardware (bricks).

implemented a universal asynchronous receiver-transmitter (uart) on a cyclone iv fpga.

![integrated circuit](https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop)

## modules
- baud rate generator
- tx state machine
- rx state machine with oversampling

works reliably at 115200 baud.
    `
  },
  {
    id: '3d-printed-robot-arm',
    title: '3d-printed-robot-arm',
    displayTitle: '3d printed robot arm',
    category: 'bits2bricks',
    date: '2024-03-20',
    thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400&auto=format&fit=crop',
    description: 'inverse kinematics on an arduino.',
    content: `
# 3d printed robot arm

designed in fusion360, printed in petg.

controlled by an arduino mega computing inverse kinematics on the fly. 

![robotic parts](https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?q=80&w=800&auto=format&fit=crop)

the servo jitter was an issue, solved by adding capacitors to the power rail. hardware is messy.
    `
  }
];