export interface ShortNote {
  id: string;
  date: string;
  title: string;
  body: string[];
  marker?: string;
}

// Informal by design: one observation, a few paragraphs, no article machinery.
export const shortNotes: ShortNote[] = [
  {
    id: 'safety-is-not-a-mandate', date: '2026-09-01', title: 'Safety is not a mandate', marker: 'FIELD / 013',
    body: [
      'I love self driving cars. I would like my car to drive me around while I look out the window and do nothing. This seems obviously good.',
      'Tesla says more than 70,000 people already use FSD in five European countries, driving over a million kilometres a day. Across roughly 100 million kilometres, Tesla reports 4.1x fewer crashes than manual driving. Here is [Tesla’s FSD evidence dashboard](https://www.tesla.com/fsd-evidence-dashboard).',
      'Great. Approve it.',
      'Somehow “this is safer” becomes “and therefore humans should be banned from driving.” Bro that is a completely different sentence.',
      'If it is really four times safer, you do not need a mandate. Make it legal, make the data public, let insurers price the risk, let people use it, let the price fall. People are not so committed to crashing that the government needs to force them into the safer car.',
      'Europe has this weird instinct where it finds a technology that may remove a huge source of accidental death and immediately asks how to turn it into another compulsory subscription to modern life.',
      'You want adoption? Make it better. You want resentment? Make it mandatory.',
      'Technology should increase the set of things humans are allowed to do, not reduce it.',
    ],
  },
  {
    id: 'the-2012-volkswagen', date: '2026-09-01', title: 'The poor guy with the 2012 Volkswagen', marker: 'FIELD / 012',
    body: [
      'There is always one guy missing from these conversations. He earns 1,500 euros a month and drives a 2012 Volkswagen that works perfectly fine.',
      'FSD is safer, therefore manual driving should be illegal. Cool. Who buys him the new car?',
      'The state? Tesla? Or the person earning 1,500 euros a month whose perfectly functional 2012 Volkswagen has just been outlawed?',
      'Then there is the plumber with a van, the delivery truck, the farmer and every strange commercial vehicle. These are likely to be the last five percent autonomy solves, not the first ninety-five percent.',
      'You can make almost anything safer by banning the cheaper version. Stairs would be safer if everybody had an elevator.',
      'I think autonomy will probably become overwhelmingly safer. The interesting problem is getting from here to there without turning progress into a tax on people who bought the previous technology ten years ago.',
      'Fortunately markets are pretty good at this. First it is expensive and weird. Then your rich friend has it. Then your taxi has it. Then every new car has it. Then nobody remembers why cars ever shipped without it.',
      'You do not need a prohibition. You need time.',
    ],
  },
  {
    id: 'buses-are-not-cars', date: '2026-09-01', title: 'Buses are not cars with more seats', marker: 'FIELD / 011',
    body: [
      'Another strange response to autonomous cars is: actually we should delete cars and build trains and electric buses.',
      'Sure, build them. I like trains too.',
      'Public transport works when many people want to travel from roughly the same place to roughly the same place at roughly the same time. A car solves almost the opposite problem.',
      'This is why cities contain trains and bicycles and vans and pedestrians instead of discovering The Correct Transportation Technology and deleting everything else.',
      'Autonomy makes the system more interesting. The marginal cost of moving a vehicle falls. Parking changes. Elderly people gain mobility. Children may eventually gain mobility. Drunk people stop needing a designated driver. Delivery and commuting patterns change. Perhaps ownership changes too.',
      'Some of these second order effects will be great. Some will be very stupid. Nobody knows which. That is the fun part.',
      'Whenever someone claims to know the optimal transport system for a continent of 450 million people, I mostly want that person to have less power.',
    ],
  },
  {
    id: 'europe-solves-the-second-problem', date: '2026-09-01', title: 'Europe keeps solving the second problem first', marker: 'FIELD / 010',
    body: [
      'The crazy thing about European FSD is not that Europe has failed to ban manual driving. We are debating the ban while FSD is still asking for permission to drive.',
      '[Tesla’s own case](https://www.tesla.com/fsd-evidence-dashboard) is aggressive: around one million miles of European validation, more than 230,000 fixed-route scenario tests, and big improvements in several safety proxies.',
      'Tesla is not neutral. Tesla also says the fleet studies are observational and cannot fully control for weather, traffic, time of day or selection effects. Fine. Look harder at the evidence.',
      'Run larger trials. Require disclosure. Let competitors reproduce the results. Change the rules as the evidence changes.',
      'What Europe should not do is spend five years asking whether a neural network is philosophically compatible with a rule written for deterministic driver-assistance software. Here is [UN Regulation 171](https://unece.org/sites/default/files/2025-03/R171e.pdf), and here is [UNECE’s short explanation](https://unece.org/media/transport/Vehicle-Regulations/press/395206).',
      'Uncertainty is not a reason to freeze the old system in amber. Permit first. Measure aggressively. Correct quickly.',
      'Regulation should be a debugger, not an operating system.',
    ],
  },
  {
    id: 'tesla-grading-tesla', date: '2026-09-01', title: 'Tesla grading Tesla', marker: 'FIELD / 009',
    body: [
      'There is one awkward thing about [the FSD evidence dashboard](https://www.tesla.com/fsd-evidence-dashboard). Tesla built the system. Tesla runs the fleet. Tesla defines the metrics. Tesla collects the data. Tesla picks the studies. Then Tesla tells us Tesla is safer.',
      'This does not mean the numbers are wrong. It means the scientific process should not end there.',
      'To Tesla’s credit, the methodological note says this pretty clearly. The comparisons are observational, not randomized. They do not fully control for traffic, weather, road complexity, time of day or when drivers choose to engage FSD.',
      'That matters. Drivers may engage FSD mostly on roads where it works well, while the manual-driving sample contains every terrible intersection, snowstorm, drunk 2am trip and delivery van doing something illegal in Naples. A raw crash ratio can then overstate the causal effect.',
      'Maybe after proper controls FSD is still four times safer. Maybe it is eight times. Maybe it is 1.7 times. I have no idea!',
      'This is not an argument for blocking FSD. It is an argument for making the evidence less dependent on Tesla.',
      'Publish standardized incident data. Give insurers and regulators access. Let universities reproduce the analysis. Require Waymo, Tesla, Mercedes and whoever comes next to report comparable metrics.',
      'If autonomy is much safer than humans, independent evidence will eventually make arguing against it look like arguing against seatbelts.',
      'I like Tesla. I would also prefer Tesla not to be the only person marking Tesla’s homework.',
      'Trust the technology enough to test it properly.',
    ],
  },
  {
    id: 'systems-that-explain-themselves',
    date: '2026-08-29',
    title: 'Systems that explain themselves',
    marker: 'FIELD / 008',
    body: [
      'A system becomes operationally real when the people around it can tell what it is doing without asking its author. Until then it is still a demonstration, however impressive the model or interface may be.',
      'This is why observability is not an accessory added after deployment. The traces, failure states, thresholds and human-readable explanations are part of the product. They form the shared language through which an operator can disagree with the machine.',
      'The strongest systems expose their uncertainty at the same resolution at which decisions are made. A global confidence score is rarely enough. Someone needs to know which input was missing, which assumption became fragile and what changed since the previous result.',
      'Legibility also changes engineering behaviour. When failure is visible and attributable, teams stop treating incidents as mysterious exceptions and begin treating them as information about the system boundary.',
      'The final test is simple: if the original engineer disappears for a month, can the system still be inspected, challenged and safely operated? If not, the knowledge is not yet in the system. It is still trapped in a person.',
    ],
  },
  {
    id: 'the-shape-of-reliable-ai',
    date: '2026-08-28',
    title: 'The shape of reliable AI',
    marker: 'FIELD / 007',
    body: [
      'Reliability in AI is often discussed as if it were a property of the model. In production it is more often a property of the surrounding system.',
      'The model may be variable while the product remains dependable because inputs are constrained, outputs are checked, retries are bounded, providers can fail over and humans are inserted exactly where ambiguity becomes expensive.',
      'That distinction matters. Trying to remove all uncertainty from a probabilistic component is usually impossible. Designing a system that knows how to contain uncertainty is an engineering problem, and therefore tractable.',
      'Evaluation belongs inside that containment structure. It is not a leaderboard assembled at the end; it is evidence attached to every meaningful release decision.',
    ],
  },
  {
    id: 'interfaces-as-instruments',
    date: '2026-08-28',
    title: 'Interfaces as instruments',
    marker: 'FIELD / 006',
    body: [
      'An interface is an instrument when it helps someone perceive a relationship that would otherwise remain hidden.',
      'The distinction is useful because instruments are judged differently from decoration. Their hierarchy must correspond to consequence. Their latency changes what can be noticed. Their defaults encode a theory about normal operation.',
      'A good instrument does not merely present data. It gives the eye somewhere precise to stand.',
    ],
  },
  {
    id: 'deployment-is-a-contact-sport',
    date: '2026-08-27',
    title: 'Deployment is a contact sport',
    marker: 'FIELD / 005',
    body: [
      'A prototype lives in the world described by its author. A deployed system lives in everybody else’s world.',
      'That world contains malformed documents, interrupted connections, institutional habits, unusual permissions, old browsers, budget limits and people who use the correct feature in a way nobody predicted.',
      'Deployment is the moment a technical idea makes contact with all those constraints simultaneously. The resulting friction is not evidence that implementation distracted from the real work. It is the real work becoming visible.',
      'This is also why operational experience compounds differently from tutorial knowledge. Each failure adds a boundary condition to your internal model of what a system actually is.',
      'Eventually architecture stops looking like a collection of preferred technologies and starts looking like a record of which failures you have learned to anticipate.',
      'The goal is not a system that never fails. It is one whose failures are bounded, observable and recoverable—and whose users are never required to understand the machinery in order to remain safe.',
    ],
  },
  {
    id: 'friction-is-information',
    date: '2026-08-27',
    title: 'Friction is information',
    marker: 'FIELD / 004',
    body: [
      'When a tool keeps asking for the same workaround, the workaround is not the interesting part. The repetition is.',
      'A surprising amount of engineering starts by noticing what you have quietly learned to tolerate.',
    ],
  },
  {
    id: 'small-models',
    date: '2026-08-21',
    title: 'Small models of the world',
    marker: 'FIELD / 003',
    body: [
      'Every useful instrument is a small argument about what matters. It removes almost everything, then makes one relationship impossible to ignore.',
      'Good interfaces do the same thing.',
    ],
  },
  {
    id: 'control-without-theatre',
    date: '2026-08-14',
    title: 'Control without theatre',
    marker: 'FIELD / 002',
    body: [
      'The best controller often looks boring from the outside. No drama, no visible correction, just a system that refuses to become interesting.',
      'That is probably why people underestimate how much thought is hidden inside stability.',
    ],
  },
  {
    id: 'build-the-probe',
    date: '2026-08-05',
    title: 'Build the probe first',
    marker: 'FIELD / 001',
    body: [
      'Before improving a system, make it capable of surprising you. A rough probe that reveals the wrong assumption is worth more than a polished dashboard confirming it.',
    ],
  },
];
