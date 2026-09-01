import React, { useMemo, useState } from 'react';
import { AboutTopBar } from '../components/AboutTopBar';

type StackCategory = 'AI' | 'Industrial' | 'Infrastructure' | 'Data' | 'Development';

type StackItem = {
  name: string;
  description: string;
  category: StackCategory;
  slug?: string;
  icon?: string;
  href?: string;
  monochrome?: boolean;
  wordmark?: boolean;
};

const stack: StackItem[] = [
  { name: 'Python', description: 'My default language for AI systems, automation and data-intensive engineering.', category: 'Development', slug: 'python', href: 'https://www.python.org/' },
  { name: 'PyTorch', description: 'Research, model experimentation and production-oriented deep learning.', category: 'AI', slug: 'pytorch', href: 'https://pytorch.org/' },
  { name: 'DSPy', description: 'Programmatic optimization and evaluation of compound language-model systems.', category: 'AI', icon: '/tool-icons/dspy.svg', href: 'https://dspy.ai/' },
  { name: 'Hugging Face', description: 'Models, datasets and an open ecosystem for applied machine learning.', category: 'AI', slug: 'huggingface', href: 'https://huggingface.co/' },
  { name: 'OpenAI', description: 'Foundation models and APIs for reliable, tool-using AI applications.', category: 'AI', icon: '/tool-icons/openai.svg', href: 'https://openai.com/' },
  { name: 'Azure AI Foundry', description: 'Enterprise model deployment, evaluation and operational governance.', category: 'AI', icon: '/tool-icons/azure.svg', href: 'https://ai.azure.com/' },
  { name: 'Linux', description: 'The operating environment beneath almost everything I deploy and debug.', category: 'Infrastructure', slug: 'linux', href: 'https://kernel.org/', monochrome: true },
  { name: 'Docker', description: 'Reproducible services and a clean boundary between code and infrastructure.', category: 'Infrastructure', slug: 'docker', href: 'https://www.docker.com/' },
  { name: 'Kubernetes', description: 'Orchestration for resilient, observable and independently scalable services.', category: 'Infrastructure', slug: 'kubernetes', href: 'https://kubernetes.io/' },
  { name: 'OpenTelemetry', description: 'Vendor-neutral traces, metrics and logs for understanding live systems.', category: 'Infrastructure', slug: 'opentelemetry', href: 'https://opentelemetry.io/', monochrome: true },
  { name: 'Grafana', description: 'Operational dashboards that turn telemetry into decisions.', category: 'Infrastructure', slug: 'grafana', href: 'https://grafana.com/' },
  { name: 'GitHub Actions', description: 'Automated tests, delivery gates and repeatable deployments.', category: 'Infrastructure', slug: 'githubactions', href: 'https://github.com/features/actions' },
  { name: 'Cloudflare Workers', description: 'Edge deployment, serverless APIs and globally distributed application infrastructure.', category: 'Infrastructure', icon: '/tool-icons/si-cloudflare.svg', href: 'https://workers.cloudflare.com/' },
  { name: 'PostgreSQL', description: 'The dependable default for relational product and operational data.', category: 'Data', slug: 'postgresql', href: 'https://www.postgresql.org/' },
  { name: 'Cloudflare D1', description: 'Serverless SQL at the edge for lightweight, production-facing application data.', category: 'Data', icon: '/tool-icons/si-cloudflare.svg', href: 'https://developers.cloudflare.com/d1/' },
  { name: 'InfluxDB', description: 'Time-series storage for telemetry, sensors and operational measurements.', category: 'Data', slug: 'influxdb', href: 'https://www.influxdata.com/' },
  { name: 'TimescaleDB', description: 'PostgreSQL-native time-series workloads with familiar SQL semantics.', category: 'Data', slug: 'timescale', href: 'https://www.timescale.com/' },
  { name: 'Pandas', description: 'Fast inspection, transformation and validation of imperfect real-world data.', category: 'Data', slug: 'pandas', href: 'https://pandas.pydata.org/', monochrome: true },
  { name: 'NumPy', description: 'Numerical arrays and the computational foundation beneath scientific Python workflows.', category: 'Data', icon: '/tool-icons/si-numpy.svg', href: 'https://numpy.org/' },
  { name: 'Scikit-learn', description: 'Classical machine learning, preprocessing and reproducible model baselines.', category: 'AI', slug: 'scikitlearn', href: 'https://scikit-learn.org/' },
  { name: 'OpenCV', description: 'Computer-vision pipelines, image processing and measurement from pixels.', category: 'AI', slug: 'opencv', href: 'https://opencv.org/' },
  { name: 'LangChain', description: 'Composition and integration of tool-using language-model workflows.', category: 'AI', slug: 'langchain', href: 'https://www.langchain.com/' },
  { name: 'C++', description: 'Systems, embedded and performance-sensitive engineering close to the machine.', category: 'Development', slug: 'cplusplus', href: 'https://isocpp.org/' },
  { name: 'R', description: 'Statistical analysis, experiments and exploratory modelling.', category: 'Data', icon: '/tool-icons/r-project.svg', href: 'https://www.r-project.org/' },
  { name: 'RStudio', description: 'A practical environment for statistical analysis and reproducible reports.', category: 'Data', slug: 'rstudioide', href: 'https://posit.co/products/open-source/rstudio/' },
  { name: 'ROS 2', description: 'A production-minded software layer for robotics and distributed physical systems.', category: 'Industrial', slug: 'ros', href: 'https://docs.ros.org/en/rolling/' },
  { name: 'LabVIEW', description: 'Instrumentation, acquisition and control close to physical experiments.', category: 'Industrial', icon: '/tool-icons/labview.svg', href: 'https://www.ni.com/labview/' },
  { name: 'PLC', description: 'Deterministic control logic and the realities of industrial automation.', category: 'Industrial', icon: '/tool-icons/plc-siemens.svg' },
  { name: 'MQTT', description: 'Lightweight messaging between devices, gateways and cloud services.', category: 'Industrial', slug: 'mqtt', href: 'https://mqtt.org/' },
  { name: 'OPC UA', description: 'Interoperable industrial data exchange with semantics and security.', category: 'Industrial', icon: '/tool-icons/opc-ua.svg' },
  { name: 'Modbus', description: 'Simple, widespread communication with industrial equipment.', category: 'Industrial', icon: '/tool-icons/modbus.svg' },
  { name: 'CAN bus', description: 'Robust embedded communication where timing and failure modes matter.', category: 'Industrial', icon: '/tool-icons/can-bus.svg' },
  { name: 'Node-RED', description: 'Rapid event-flow prototyping across devices, APIs and operational systems.', category: 'Industrial', slug: 'nodered', href: 'https://nodered.org/' },
  { name: 'SolidWorks', description: 'Mechanical design, assemblies and production-oriented CAD.', category: 'Industrial', icon: '/tool-icons/solidworks.svg', href: 'https://www.solidworks.com/' },
  { name: 'AutoCAD', description: 'Technical drawings and geometry shared across engineering disciplines.', category: 'Industrial', icon: '/tool-icons/autocad.svg', href: 'https://www.autodesk.com/products/autocad/', wordmark: true },
  { name: 'Ansys', description: 'Finite-element simulation and engineering analysis of physical systems.', category: 'Industrial', icon: '/tool-icons/ansys.png', href: 'https://www.ansys.com/', wordmark: true },
  { name: 'Simulink', description: 'Dynamic-system modelling, control design and simulation.', category: 'Industrial', icon: '/tool-icons/simulink.jpg', href: 'https://www.mathworks.com/products/simulink.html' },
  { name: 'Arduino', description: 'Fast embedded prototypes, sensors and physical control experiments.', category: 'Industrial', slug: 'arduino', href: 'https://www.arduino.cc/' },
  { name: 'Raspberry Pi', description: 'Edge computation, gateways and compact Linux-based prototypes.', category: 'Industrial', slug: 'raspberrypi', href: 'https://www.raspberrypi.com/' },
  { name: 'TypeScript', description: 'Typed product engineering for maintainable interfaces and services.', category: 'Development', slug: 'typescript', href: 'https://www.typescriptlang.org/' },
  { name: 'React', description: 'Interactive product interfaces with a mature component model.', category: 'Development', slug: 'react', href: 'https://react.dev/' },
  { name: 'Next.js', description: 'Full-stack web delivery when performance, SEO and iteration speed matter.', category: 'Development', slug: 'nextdotjs', href: 'https://nextjs.org/', monochrome: true },
  { name: 'JavaScript', description: 'The browser runtime and connective tissue of modern web systems.', category: 'Development', slug: 'javascript', href: 'https://developer.mozilla.org/docs/Web/JavaScript' },
  { name: 'Node.js', description: 'Server-side JavaScript for APIs, automation and lightweight product infrastructure.', category: 'Development', icon: '/tool-icons/si-nodejs.svg', href: 'https://nodejs.org/' },
  { name: 'Vite', description: 'Fast, minimal tooling for modern frontend development and production builds.', category: 'Development', icon: '/tool-icons/si-vite.svg', href: 'https://vite.dev/' },
  { name: 'Tailwind CSS', description: 'Fast, constrained interface styling within component systems.', category: 'Development', slug: 'tailwindcss', href: 'https://tailwindcss.com/' },
  { name: 'Git', description: 'Versioned thinking, collaboration and a recoverable engineering workflow.', category: 'Development', slug: 'git', href: 'https://git-scm.com/' },
  { name: 'Obsidian', description: 'A durable, linked technical memory for research and project decisions.', category: 'Development', slug: 'obsidian', href: 'https://obsidian.md/' },
  { name: 'Bash', description: 'Automation and operational glue across Linux environments.', category: 'Infrastructure', slug: 'gnubash', href: 'https://www.gnu.org/software/bash/', monochrome: true },
  { name: 'Prometheus', description: 'Metrics collection and alerting for observable production systems.', category: 'Infrastructure', slug: 'prometheus', href: 'https://prometheus.io/' },
  { name: 'AWS', description: 'Cloud infrastructure and managed services for production workloads.', category: 'Infrastructure', icon: '/tool-icons/aws.svg', href: 'https://aws.amazon.com/' },
  { name: 'Solidity', description: 'Smart-contract engineering for EVM-compatible distributed systems.', category: 'Development', slug: 'solidity', href: 'https://soliditylang.org/', monochrome: true },
  { name: 'Ethereum', description: 'Programmable settlement and decentralized application infrastructure.', category: 'Infrastructure', slug: 'ethereum', href: 'https://ethereum.org/' },
];

const filters = ['All', 'AI', 'Industrial', 'Infrastructure', 'Data', 'Development'] as const;

const categoryPriorities: Partial<Record<StackCategory, string[]>> = {
  Infrastructure: ['Bash', 'Linux', 'Ethereum', 'Docker', 'Kubernetes', 'Cloudflare Workers', 'OpenTelemetry', 'Prometheus', 'Grafana', 'GitHub Actions', 'AWS'],
  Data: ['R', 'RStudio', 'Pandas', 'NumPy', 'PostgreSQL', 'Cloudflare D1', 'InfluxDB', 'TimescaleDB'],
  Development: ['Python', 'JavaScript', 'TypeScript', 'Node.js', 'C++', 'Git', 'Vite', 'Obsidian', 'Next.js', 'React', 'Tailwind CSS', 'Solidity'],
  Industrial: ['SolidWorks', 'AutoCAD', 'Ansys', 'PLC', 'Simulink', 'ROS 2', 'Arduino', 'Raspberry Pi', 'MQTT', 'LabVIEW', 'OPC UA', 'Modbus', 'CAN bus', 'Node-RED'],
};

export const StackView: React.FC = () => {
  const [active, setActive] = useState<(typeof filters)[number]>('All');
  const visibleItems = useMemo(() => {
    if (active === 'All') return stack;
    const priorities = categoryPriorities[active];
    const items = stack.filter(item => item.category === active);
    if (!priorities) return items;
    const rank = (name: string) => {
      const index = priorities.indexOf(name);
      return index === -1 ? Number.MAX_SAFE_INTEGER : index;
    };
    return items.sort((a, b) => rank(a.name) - rank(b.name));
  }, [active]);

  return (
    <article className="stack-page animate-fade-in">
      <header className="stack-header">
        <AboutTopBar active="stack" />
        <h1>Tools for systems<br />that meet <em>reality.</em></h1>
        <p>Software, protocols and engineering tools I use to move from an ambiguous problem to an observable system in production.</p>
      </header>

      <div className="stack-filters" role="group" aria-label="Filter stack by category">
        {filters.map(filter => <button type="button" key={filter} className={active === filter ? 'is-active' : ''} onClick={() => setActive(filter)}>{filter}</button>)}
      </div>

      <section className="stack-list" aria-live="polite">
        {visibleItems.map(item => {
          const initials = item.name.split(/[\s.-]+/).map(word => word[0]).join('').slice(0, 3);
          const icon = item.icon || `/tool-icons/si-${item.slug}.svg`;
          const content = <><span data-tool={item.name} className={`stack-icon${item.monochrome ? ' is-monochrome' : ''}${item.wordmark ? ' is-wordmark' : ''}`}><b aria-hidden="true">{initials}</b><img src={icon} alt="" loading="lazy" decoding="async" onError={event => { event.currentTarget.style.display = 'none'; event.currentTarget.parentElement?.classList.add('is-fallback'); }} /></span><span className="stack-copy"><strong>{item.name}</strong><small title={item.description}>{item.description}</small></span><span className="stack-category">{item.category}</span>{item.href && <span className="stack-arrow" aria-hidden="true">↗</span>}</>;
          return item.href
            ? <a className="stack-row" href={item.href} target="_blank" rel="noreferrer" key={item.name} aria-label={`${item.name} — official website`}>{content}</a>
            : <div className="stack-row" key={item.name}>{content}</div>;
        })}
      </section>

    </article>
  );
};
