export type ProjectCategory = 'All' | 'Full-Stack' | 'AI Systems' | 'Infrastructure';

export interface TechStackItem {
  id: string;
  name: string;
  domain: string;
  experience: string;
  summary: string;
  capabilities: string[];
  relatedProjectIds: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  category: Exclude<ProjectCategory, 'All'>;
  year: string;
  role: string;
  summary: string;
  description: string;
  image: string;
  imageAlt: string;
  stack: string[];
  architecture: string[];
  outcomes: {
    metric: string;
    label: string;
  }[];
  liveUrl: string;
  githubUrl: string;
}

export const DEVELOPER_PROFILE = {
  name: 'Darian Mercer',
  role: 'Full-Stack Systems Engineer',
  location: 'San Francisco, CA',
  availability: 'Available for staff engineering & advisory roles',
  email: 'hello@darianmercer.dev',
  githubUrl: 'https://github.com/darianmercer',
  linkedinUrl: 'https://linkedin.com/in/darianmercer',
  xUrl: 'https://x.com/darianmercer',
  heroSummary:
    'I architect resilient full-stack web platforms, real-time 3D interfaces, and production AI retrieval pipelines built for low latency and enduring craft.',
  aboutLead:
    'Over the past eight years, I have led end-to-end architecture across distributed Node.js backends, high-throughput MongoDB data layers, and precision React & Next.js interfaces.',
  aboutBody:
    'My work sits at the intersection of systems rigor and tactile interface engineering—turning complex streaming telemetry, multi-tenant APIs, and applied AI workflows into responsive software that feels effortless under load.',
  metrics: [
    {
      value: '8+ yrs',
      label: 'Full-stack production systems delivered across fintech & developer infrastructure',
    },
    {
      value: '< 42 ms',
      label: 'Median p95 API latency across edge-routed Node.js & MongoDB deployments',
    },
    {
      value: '3.4M+',
      label: 'Monthly active sessions served across React, Next.js, and WebGL applications',
    },
  ],
};

export const TECH_STACK: TechStackItem[] = [
  {
    id: 'react',
    name: 'React',
    domain: 'Interactive UI & Canvas Architecture',
    experience: '7+ years',
    summary:
      'Concurrent UI engineering, custom design systems, zero-jank state orchestration, and isolated WebGL/Three.js lifecycles.',
    capabilities: [
      'React 19 concurrent rendering & transitions',
      'Accessible keyboard-first component libraries',
      'Ref-isolated Three.js & Canvas integration',
    ],
    relatedProjectIds: ['kestrel-studio', 'caldera-pay'],
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    domain: 'Full-Stack Web Platform',
    experience: '5+ years',
    summary:
      'App Router architectures, streaming React Server Components, edge middleware, and incremental static regeneration.',
    capabilities: [
      'Server Actions & streaming SSR pipelines',
      'Edge caching, ISR & multi-region routing',
      'Core Web Vitals & bundle optimization',
    ],
    relatedProjectIds: ['veridian-mesh', 'solis-retrieval'],
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    domain: 'Distributed Services & Streaming',
    experience: '7+ years',
    summary:
      'Event-driven microservices, high-concurrency WebSocket gateways, worker queues, and structured observability.',
    capabilities: [
      'Express & Fastify API gateways',
      'Backpressure-safe streams & WebSockets',
      'OpenTelemetry tracing & circuit breakers',
    ],
    relatedProjectIds: ['veridian-mesh', 'caldera-pay', 'kestrel-studio'],
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    domain: 'Document & Vector Persistence',
    experience: '6+ years',
    summary:
      'Schema modeling for high-write workloads, aggregation pipelines, change streams, and Atlas Vector Search.',
    capabilities: [
      'Compound indexing & sharded cluster design',
      'Real-time Change Streams & event sourcing',
      'Hybrid lexical + vector search pipelines',
    ],
    relatedProjectIds: ['veridian-mesh', 'solis-retrieval', 'caldera-pay'],
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    domain: 'End-to-End Type Safety',
    experience: '6+ years',
    summary:
      'Strict shared domain contracts from database schema to client state, eliminating runtime integration drift.',
    capabilities: [
      'Strict monorepo shared schemas & RPC contracts',
      'Discriminated unions & exhaustive state machines',
      'Runtime validation with zero-overhead codecs',
    ],
    relatedProjectIds: ['veridian-mesh', 'kestrel-studio', 'solis-retrieval', 'caldera-pay'],
  },
  {
    id: 'ai',
    name: 'AI',
    domain: 'Applied Retrieval & Agent Workflows',
    experience: '3+ years',
    summary:
      'Grounded RAG pipelines, hybrid semantic reranking, structured tool execution, and deterministic evaluation harnesses.',
    capabilities: [
      'Hybrid vector + BM25 retrieval with citations',
      'Streaming structured JSON & tool calling',
      'Automated latency, accuracy & drift evals',
    ],
    relatedProjectIds: ['solis-retrieval', 'kestrel-studio'],
  },
];

export const PROJECTS: ProjectItem[] = [
  {
    id: 'veridian-mesh',
    title: 'Veridian Mesh',
    category: 'Infrastructure',
    year: '2026',
    role: 'Lead Architect',
    summary:
      'Distributed edge-routing control plane with live topology visualization and sub-second failover policies.',
    description:
      'Designed and built an enterprise control plane for routing API traffic across 18 global edge regions. Combines a streaming Next.js workspace with an event-driven Node.js ingestion tier backed by MongoDB time-series collections.',
    image: '/src/assets/images/project_veridian_mesh_1795619317888.jpg',
    imageAlt:
      'Isometric architectural visualization of obsidian server nodes connected by ice-blue optical links over a dark drafting grid',
    stack: ['Next.js', 'Node.js', 'TypeScript', 'MongoDB'],
    architecture: [
      'Streaming React Server Components paired with WebSocket delta updates for 12,000+ live route rules.',
      'MongoDB time-series buckets with TTL rollups reducing storage overhead by 61% across 90-day telemetry windows.',
      'Deterministic policy dry-run engine written in strict TypeScript to validate routing changes before global push.',
    ],
    outcomes: [
      { metric: '38 ms', label: 'Global policy propagation p95' },
      { metric: '99.99%', label: 'Measured control-plane uptime over 14 months' },
      { metric: '-61%', label: 'Telemetry storage footprint reduction' },
    ],
    liveUrl: 'https://veridian-mesh.example.com',
    githubUrl: 'https://github.com/darianmercer/veridian-mesh',
  },
  {
    id: 'solis-retrieval',
    title: 'Solis Retrieval',
    category: 'AI Systems',
    year: '2026',
    role: 'Principal Full-Stack Engineer',
    summary:
      'Hybrid semantic search and inline citation engine for engineering handbooks, RFCs, and incident archives.',
    description:
      'Built an end-to-end retrieval platform that ingests technical documentation, indexes semantic embeddings alongside exact lexical tokens in MongoDB Atlas Vector Search, and streams source-verified answers with paragraph-level citations.',
    image: '/src/assets/images/project_solis_retrieval_1795619293545.jpg',
    imageAlt:
      'Smoky glass prisms and matte charcoal ceramic blocks refracting a clean cobalt light beam across dark slate',
    stack: ['Next.js', 'AI', 'TypeScript', 'MongoDB'],
    architecture: [
      'Reciprocal rank fusion combining dense vector retrieval and exact symbol matching for code & API queries.',
      'Incremental document chunking workers triggered via webhook diffs so index freshness stays under 45 seconds.',
      'Automated citation-grounding evaluator verifying every synthesized statement against retrieved source spans.',
    ],
    outcomes: [
      { metric: '94.2%', label: 'Citation accuracy across 1,200 benchmark queries' },
      { metric: '680 ms', label: 'Time to first streamed answer token' },
      { metric: '18,500', label: 'Indexed internal RFCs and runbooks' },
    ],
    liveUrl: 'https://solis-retrieval.example.com',
    githubUrl: 'https://github.com/darianmercer/solis-retrieval',
  },
  {
    id: 'kestrel-studio',
    title: 'Kestrel Studio',
    category: 'Full-Stack',
    year: '2025',
    role: 'Creator & Core Engineer',
    summary:
      'Collaborative browser-based parametric drafting and spatial prototyping workbench running at 60 FPS.',
    description:
      'A multiplayer technical design workspace enabling product teams to sketch parametric constraints, preview procedural WebGL extrusions in real time, and export clean SVG or TypeScript geometry definitions.',
    image: '/src/assets/images/project_kestrel_studio_1795619293545.jpg',
    imageAlt:
      'Precision drafting compass resting on layered dark frosted glass panels with subtle silver-blue spline lines',
    stack: ['React', 'TypeScript', 'Node.js', 'AI'],
    architecture: [
      'Isolated Three.js rendering loop decoupled from React UI state to keep frame pacing steady during live edits.',
      'CRDT-backed multiplayer synchronization over Node.js WebSockets with sub-30ms presence cursors.',
      'AI-assisted constraint solver translating natural-language geometric adjustments into typed parameter diffs.',
    ],
    outcomes: [
      { metric: '60 FPS', label: 'Sustained viewport performance with 4,000+ nodes' },
      { metric: '24 ms', label: 'Average multiplayer cursor & edit sync' },
      { metric: '11k+', label: 'Exported production geometry specs' },
    ],
    liveUrl: 'https://kestrel-studio.example.com',
    githubUrl: 'https://github.com/darianmercer/kestrel-studio',
  },
  {
    id: 'caldera-pay',
    title: 'Caldera Pay',
    category: 'Full-Stack',
    year: '2025',
    role: 'Staff Systems Engineer',
    summary:
      'Double-entry settlement ledger and webhook orchestration platform for multi-currency developer APIs.',
    description:
      'Engineered an idempotent financial ledger and merchant dashboard capable of reconciling high-volume usage billing across 32 currencies with full audit trails and real-time anomaly alerts.',
    image: '/src/assets/images/project_caldera_pay_1795619315452.jpg',
    imageAlt:
      'Machined dark titanium and frosted sapphire glass ledger plates arranged in an isometric cascade',
    stack: ['Node.js', 'MongoDB', 'React', 'TypeScript'],
    architecture: [
      'Immutable double-entry ledger enforced via MongoDB multi-document ACID transactions and idempotency keys.',
      'Exponential-backoff webhook delivery engine with dead-letter replay and cryptographic signature inspection.',
      'High-density React reconciliation console with keyboard navigation and tabular financial reporting.',
    ],
    outcomes: [
      { metric: '$48M+', label: 'Reconciled settlement volume in year one' },
      { metric: '0', label: 'Duplicate postings across 14M+ ledger writes' },
      { metric: '99.98%', label: 'First-attempt webhook delivery rate' },
    ],
    liveUrl: 'https://caldera-pay.example.com',
    githubUrl: 'https://github.com/darianmercer/caldera-pay',
  },
];

export const RESUME_CONTENT = {
  headline: 'Darian Mercer — Full-Stack Systems Engineer',
  contactLine: 'San Francisco, CA · hello@darianmercer.dev · github.com/darianmercer',
  summary:
    'Full-stack systems engineer with 8+ years designing high-throughput TypeScript, React, Next.js, Node.js, MongoDB, and applied AI platforms. Focused on low-latency distributed APIs, real-time 3D web experiences, and clean product architecture.',
  experience: [
    {
      role: 'Staff Full-Stack Engineer',
      company: 'Veridian Cloud Systems',
      period: '2023 – Present',
      highlights: [
        'Architected edge-routing control plane serving 18 global regions with 38 ms p95 policy propagation.',
        'Designed hybrid semantic + lexical retrieval engine (Next.js, MongoDB Vector Search) achieving 94.2% citation accuracy.',
        'Mentored 9 engineers on TypeScript domain contracts, MongoDB indexing strategy, and frontend performance.',
      ],
    },
    {
      role: 'Senior Full-Stack Engineer',
      company: 'Caldera Financial Infrastructure',
      period: '2020 – 2023',
      highlights: [
        'Built immutable double-entry settlement ledger processing $48M+ in multi-currency volume with zero duplicate writes.',
        'Reduced dashboard bundle weight by 47% and improved interaction latency under 100 ms across complex tabular views.',
      ],
    },
    {
      role: 'Software Engineer',
      company: 'Northstar Interactive',
      period: '2018 – 2020',
      highlights: [
        'Delivered real-time React & Three.js web visualizers and Node.js asset pipelines for industrial design clients.',
      ],
    },
  ],
  education: 'B.S. in Computer Science — University of Washington',
};

export function buildPlainTextResume(): string {
  const lines: string[] = [
    RESUME_CONTENT.headline,
    RESUME_CONTENT.contactLine,
    '',
    'SUMMARY',
    RESUME_CONTENT.summary,
    '',
    'CORE STACK',
    'React, Next.js, Node.js, MongoDB, TypeScript, Applied AI (RAG, Vector Search, Evaluation)',
    '',
    'EXPERIENCE',
    ...RESUME_CONTENT.experience.flatMap((exp) => [
      `${exp.role} — ${exp.company} (${exp.period})`,
      ...exp.highlights.map((h) => `  • ${h}`),
      '',
    ]),
    'EDUCATION',
    RESUME_CONTENT.education,
  ];
  return lines.join('\n');
}
