import { Post } from './types';

export const logPosts: Post[] = [
  {
    id: 'log-001',
    title: 'cognitive-overhead',
    displayTitle: 'cognitive overhead',
    category: 'fieldnotes',
    date: '2024-04-01',
    description: 'measuring mental friction.',
    content: `
# cognitive overhead

switching contexts costs glucose. every time i switch from frontend to fpga design, there is a 15 minute penalty.

to mitigate:
- strict time blocking
- analogue notes before digital entry
- monochromatic environments reduce visual noise
    `
  },
  {
    id: 'log-002',
    title: 'reading-list-q2',
    displayTitle: 'reading list q2',
    category: 'fieldnotes',
    date: '2024-04-05',
    description: 'current intake.',
    content: `
# reading list q2

1. "godel, escher, bach" (re-read)
2. "designing data-intensive applications"
3. "the art of electronics"

input determines output. garbage in, garbage out.
    `
  },
  {
    id: 'log-003',
    title: 'sleep-architecture',
    displayTitle: 'sleep architecture',
    category: 'fieldnotes',
    date: '2024-04-10',
    description: 'optimizing rem cycles.',
    content: `
# sleep architecture

adjusting room temp to 18c seems to improve deep sleep duration by 15%.
keeping light pollution to 0 lux is non-negotiable.
    `
  }
];