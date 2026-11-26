export type ProjectCategory = 'All' | 'Full-Stack' | 'AI Systems' | 'Platform';
export type EditableProjectCategory = Exclude<ProjectCategory, 'All'>;
export type AccentTheme = 'sapphire' | 'emerald' | 'amber';
export type MessageStatus = 'unread' | 'read' | 'archived';

export interface HighlightMetric {
  value: string;
  label: string;
}

export interface SectionVisibility {
  about: boolean;
  skills: boolean;
  projects: boolean;
  certificates: boolean;
  education: boolean;
  contact: boolean;
}

export interface SceneSettings {
  coreSpeed: number;
  accentTheme: AccentTheme;
  showParticles: boolean;
}

export interface PortfolioProfile {
  name: string;
  role: string;
  headline: string;
  location: string;
  availability: string;
  email: string;
  phone: string;
  showPhone: boolean;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  resumeUrl: string;
  heroSummary: string;
  aboutLead: string;
  aboutBody: string;
  metrics: HighlightMetric[];
  sectionVisibility: SectionVisibility;
  sceneSettings: SceneSettings;
}

export interface SkillCategory {
  id: string;
  name: string;
  domain: string;
  experience: string;
  summary: string;
  items: string[];
  order: number;
  published: boolean;
}

export interface ProjectOutcome {
  metric: string;
  label: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: EditableProjectCategory;
  year: string;
  role: string;
  summary: string;
  description: string;
  image: string;
  imageAlt: string;
  stack: string[];
  architecture: string[];
  outcomes: ProjectOutcome[];
  liveUrl: string;
  githubUrl: string;
  featured: boolean;
  order: number;
  published: boolean;
}

export interface CertificateItem {
  id: string;
  title: string;
  program: string;
  issuer: string;
  issuedYear: string;
  description: string;
  credentialUrl: string;
  order: number;
  published: boolean;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  department: string;
  period: string;
  cgpa: string;
  status: string;
  order: number;
  published: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAtMs: number;
}

export const PROJECT_IMAGE_PRESETS = [
  {
    label: 'Network Architecture Grid',
    url: '/src/assets/images/project_veridian_mesh_1795619317888.jpg',
  },
  {
    label: 'Drafting Glass Studio',
    url: '/src/assets/images/project_kestrel_studio_1795619293545.jpg',
  },
  {
    label: 'Optical Prism Beam',
    url: '/src/assets/images/project_solis_retrieval_1795619293545.jpg',
  },
  {
    label: 'Titanium Glass Ledger',
    url: '/src/assets/images/project_caldera_pay_1795619315452.jpg',
  },
];

export const DEFAULT_PROFILE: PortfolioProfile = {
  name: 'Ibrahim Chowdhury',
  role: 'Full Stack Web Developer',
  headline: 'Building scalable full-stack web systems accelerated by modern AI tooling',
  location: 'Islamic University, Bangladesh',
  availability: 'Final-year BSc ICT Engineering · Open to Full-Stack roles & freelance builds',
  email: 'ibrahimchowdhury1000@gmail.com',
  phone: '01734935995',
  showPhone: true,
  githubUrl: 'https://github.com/ibrahimchowdhury',
  linkedinUrl: 'https://linkedin.com/in/ibrahimchowdhury',
  portfolioUrl: 'https://ibrahimchowdhury.dev',
  resumeUrl: '/assets/aistudio/New_Ibrahim_cv_71d777f1.pdf',
  heroSummary:
    'Full Stack Web Developer with hands-on expertise building high-performance applications using Next.js, React, Node.js, Express, MongoDB, Tailwind CSS, Supabase, and Firebase—paired with AI-assisted engineering workflows.',
  aboutLead:
    'I specialize in architecting clean, scalable full-stack applications from responsive React & Next.js interfaces down to RBAC-secured Node.js APIs, MongoDB Atlas, and Supabase/Firebase backends.',
  aboutBody:
    'By combining strong engineering fundamentals with modern AI-powered development tools—including Claude, OpenCode, GitHub Copilot, Cursor, Antigravity, and Kiro AI—I accelerate architecture, debugging, and production shipping without compromising code quality or UX.',
  metrics: [
    {
      value: '20%',
      label: 'Institutional workflows automated via School Management System admin panel',
    },
    {
      value: '4+ Apps',
      label: 'Production full-stack platforms built across education, SaaS & productivity',
    },
    {
      value: '3.35 CGPA',
      label: 'Final-year BSc Engineering in ICT at Islamic University, Bangladesh',
    },
  ],
  sectionVisibility: {
    about: true,
    skills: true,
    projects: true,
    certificates: true,
    education: true,
    contact: true,
  },
  sceneSettings: {
    coreSpeed: 1.0,
    accentTheme: 'sapphire',
    showParticles: true,
  },
};

export const DEFAULT_SKILLS: SkillCategory[] = [
  {
    id: 'skill-frontend',
    name: 'Front-End',
    domain: 'Modern UI & Motion Architecture',
    experience: 'Core Focus',
    summary:
      'Responsive, accessible interfaces built with React.js, Next.js, Tailwind CSS, ShadCN UI, and fluid state/motion orchestration.',
    items: [
      'HTML5',
      'CSS3',
      'React.js',
      'Next.js',
      'Tailwind CSS',
      'ShadCN UI',
      'Bootstrap',
      'Framer Motion',
      'Redux',
      'Zustand',
      'Responsive Design',
      'UI/UX Optimization',
    ],
    order: 1,
    published: true,
  },
  {
    id: 'skill-backend',
    name: 'Back-End',
    domain: 'APIs & Role-Based Security',
    experience: 'Core Focus',
    summary:
      'Modular server logic, RESTful API design, Next.js API Routes, and Role-Based Access Control (RBAC) for multi-user platforms.',
    items: [
      'Node.js',
      'Express.js',
      'RESTful API Development',
      'Next.js API Routes',
      'Authorization (RBAC)',
    ],
    order: 2,
    published: true,
  },
  {
    id: 'skill-database',
    name: 'Database',
    domain: 'NoSQL & Relational Modeling',
    experience: 'Production',
    summary:
      'Structured schema modeling and query optimization across MongoDB, PostgreSQL, and SQL data stores.',
    items: ['MongoDB', 'PostgreSQL', 'SQL'],
    order: 3,
    published: true,
  },
  {
    id: 'skill-baas',
    name: 'BaaS',
    domain: 'Managed Cloud Backends',
    experience: 'Production',
    summary:
      'Rapid real-time authentication, database synchronization, storage, and security rules using Supabase, Firebase, and AppWrite.',
    items: ['Supabase', 'Firebase', 'AppWrite'],
    order: 4,
    published: true,
  },
  {
    id: 'skill-languages',
    name: 'Programming Languages',
    domain: 'Core Engineering Foundations',
    experience: 'BSc ICT',
    summary:
      'Strong algorithmic foundation across modern JavaScript (ES6+), Python, C, and C++.',
    items: ['JavaScript (ES6+)', 'Python', 'C', 'C++'],
    order: 5,
    published: true,
  },
  {
    id: 'skill-ai',
    name: 'AI-Assisted Development',
    domain: 'Accelerated Delivery & Debugging',
    experience: 'Daily Workflow',
    summary:
      'Expert at leveraging leading AI coding assistants to accelerate full-stack prototyping, refactoring, testing, and deployment.',
    items: ['Claude', 'OpenCode', 'GitHub Copilot', 'Cursor', 'Antigravity', 'Kiro AI'],
    order: 6,
    published: true,
  },
  {
    id: 'skill-tools',
    name: 'Developer Tools',
    domain: 'CI/CD & Cloud Deployment',
    experience: 'Production',
    summary:
      'End-to-end version control, API verification, cloud database hosting, and edge deployments.',
    items: ['Git', 'GitHub', 'Postman', 'Vercel', 'Netlify', 'Render', 'MongoDB Atlas'],
    order: 7,
    published: true,
  },
];

export const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 'school-management-system',
    title: 'School Management System',
    category: 'Platform',
    year: '2025',
    role: 'Full-Stack Developer',
    summary:
      'Real-world web platform for Islamic University Laboratory School and College featuring dynamic notices, events, schedules, and an independent admin panel.',
    description:
      'Developed a real-world institutional web system for Islamic University Laboratory School and College. Students, parents, and faculty access dynamic notices, academic schedules, and events while staff operate an independent admin panel that automated 20% of institutional workflows.',
    image: '/src/assets/images/project_veridian_mesh_1795619317888.jpg',
    imageAlt:
      'Architectural studio rendering of interconnected dark nodes and optical links representing institutional management infrastructure',
    stack: ['React', 'Next.js', 'Supabase', 'Cloudinary', 'Tailwind CSS'],
    architecture: [
      'Dynamic public portal serving notices, campus events, and academic schedules with fast server rendering.',
      'Independent role-based admin dashboard enabling staff to publish announcements and manage media via Cloudinary.',
      'Supabase database and authentication layer automating 20% of manual administrative workflows.',
    ],
    outcomes: [
      { metric: '20%', label: 'Institutional administrative workflows automated' },
      { metric: 'Live', label: 'Deployed for IU Laboratory School & College' },
      { metric: 'RBAC', label: 'Independent staff admin control panel' },
    ],
    liveUrl: 'https://github.com/ibrahimchowdhury',
    githubUrl: 'https://github.com/ibrahimchowdhury',
    featured: true,
    order: 1,
    published: true,
  },
  {
    id: 'personal-portfolio-cms',
    title: 'Personal Portfolio & CMS',
    category: 'Full-Stack',
    year: '2025',
    role: 'Creator & Full-Stack Developer',
    summary:
      'Modern personal portfolio engineered with a dedicated dynamic admin dashboard to manage projects, skills, experience, and certificates.',
    description:
      'Designed and built a dynamic full-stack portfolio platform featuring a dedicated admin dashboard so every section—projects, skills, credentials, experience, and site configuration—can be managed in real time without code redeploys.',
    image: '/src/assets/images/project_kestrel_studio_1795619293545.jpg',
    imageAlt:
      'Precision drafting instrument resting on layered frosted glass surfaces representing modern portfolio craftsmanship',
    stack: [
      'Next.js',
      'Next.js API',
      'Tailwind CSS',
      'Framer Motion',
      'MongoDB Atlas',
      'Cloudinary',
      'Vercel',
    ],
    architecture: [
      'Full-stack Next.js API routes connected to MongoDB Atlas for structured CRUD across projects, skills, and certificates.',
      'Cloudinary media management pipeline for optimized project thumbnails and resume assets.',
      'Fluid responsive layouts and motion choreography deployed globally on Vercel.',
    ],
    outcomes: [
      { metric: '100%', label: 'Dynamic CMS-controlled portfolio content' },
      { metric: '4 Modules', label: 'Projects, skills, experience & certificates' },
      { metric: 'Vercel', label: 'Edge-optimized production deployment' },
    ],
    liveUrl: 'https://github.com/ibrahimchowdhury',
    githubUrl: 'https://github.com/ibrahimchowdhury',
    featured: true,
    order: 2,
    published: true,
  },
  {
    id: 'ml-assignment-help',
    title: 'ML Assignment Help',
    category: 'AI Systems',
    year: '2025',
    role: 'Full-Stack Engineer',
    summary:
      'Commercial assignment platform enabling clients to submit machine learning tasks while admins manage, track, and communicate via real-time chat.',
    description:
      'Built a commercial client-to-admin assignment platform tailored for Machine Learning projects. Clients upload briefs and attachments securely through Cloudinary, track delivery milestones, and communicate directly with admins over real-time chat powered by Supabase.',
    image: '/src/assets/images/project_solis_retrieval_1795619293545.jpg',
    imageAlt:
      'Dark optical glass prisms refracting a crisp sapphire beam representing machine learning workflows',
    stack: ['React.js', 'Next.js', 'Cloudinary', 'Supabase', 'Tailwind CSS'],
    architecture: [
      'Structured client task submission workflow with multi-file attachment uploads via Cloudinary.',
      'Real-time bidirectional messaging channel between clients and administrators powered by Supabase Realtime.',
      'Centralized admin operations queue for tracking status transitions, deadlines, and client deliverables.',
    ],
    outcomes: [
      { metric: 'Real-Time', label: 'Live client-admin chat & status sync' },
      { metric: 'Commercial', label: 'End-to-end client submission portal' },
      { metric: 'Supabase', label: 'Authenticated task tracking & storage' },
    ],
    liveUrl: 'https://github.com/ibrahimchowdhury',
    githubUrl: 'https://github.com/ibrahimchowdhury',
    featured: true,
    order: 3,
    published: true,
  },
  {
    id: 'solo-leveling-gamify',
    title: 'Solo Leveling — Gamify Your Life',
    category: 'Full-Stack',
    year: '2024',
    role: 'Full-Stack Developer',
    summary:
      'Gamified task management system inspired by Solo Leveling where users create quests, complete daily habits, and earn rank points.',
    description:
      'Developed a gamified personal productivity platform inspired by Solo Leveling. Users transform daily habits into structured quests, complete body and mind challenges, accumulate XP, and climb hunter ranks with persistent progress stored in Supabase.',
    image: '/src/assets/images/project_caldera_pay_1795619315452.jpg',
    imageAlt:
      'Precision stepped dark titanium and sapphire glass tiers symbolizing quest progression and rank leveling',
    stack: ['React', 'Next.js', 'Tailwind CSS', 'Node.js', 'Supabase', 'Vercel'],
    architecture: [
      'Quest engine supporting custom daily tasks, streak tracking, and dynamic rank-tier progression.',
      'Node.js & Supabase backend persisting user stats, XP ledgers, and completed quest histories.',
      'High-contrast dark interface engineered for fast daily check-ins on both desktop and mobile.',
    ],
    outcomes: [
      { metric: 'Quests', label: 'Custom daily body & mind habit tracks' },
      { metric: 'Rank XP', label: 'Automated leveling & progression system' },
      { metric: 'Full-Stack', label: 'Next.js, Node.js & Supabase architecture' },
    ],
    liveUrl: 'https://github.com/ibrahimchowdhury',
    githubUrl: 'https://github.com/ibrahimchowdhury',
    featured: false,
    order: 4,
    published: true,
  },
];

export const DEFAULT_CERTIFICATES: CertificateItem[] = [
  {
    id: 'ostad-mern-completion',
    title: 'Completion Certificate',
    program: 'Ostad – Full Stack Web Development (MERN)',
    issuer: 'Ostad (Online Learning Platform)',
    issuedYear: '2024',
    description:
      'Awarded upon successfully completing the 6-month intensive program covering React, Node.js, Express, MongoDB, and full-stack deployment.',
    credentialUrl: '/assets/aistudio/New_Ibrahim_cv_71d777f1.pdf',
    order: 1,
    published: true,
  },
  {
    id: 'ostad-mern-assessment',
    title: 'Assessment Certificate',
    program: 'Ostad – Full Stack Web Development (MERN)',
    issuer: 'Ostad (Online Learning Platform)',
    issuedYear: '2024',
    description:
      'Earned after passing rigorous technical assessments, demonstrating hands-on proficiency in building real-world full-stack applications.',
    credentialUrl: '/assets/aistudio/New_Ibrahim_cv_71d777f1.pdf',
    order: 2,
    published: true,
  },
];

export const DEFAULT_EDUCATION: EducationItem[] = [
  {
    id: 'iu-bsc-ict',
    degree: 'BSc Engineering in Information and Communication Technology',
    institution: 'Islamic University, Bangladesh',
    department: 'Department of Information and Communication Technology (ICT)',
    period: 'Jan 2020 – Present',
    cgpa: '3.35',
    status: 'Final year',
    order: 1,
    published: true,
  },
];

// Defensive payload sanitizers synchronized verbatim with firebase-blueprint.json constraints
export function clampString(val: string, maxLen: number): string {
  return val.trim().slice(0, maxLen);
}

export function slugifyId(text: string, prefix: string): string {
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${prefix}-${cleaned || 'item'}-${suffix}`;
}

export function buildPlainTextResume(
  profile: PortfolioProfile,
  skills: SkillCategory[],
  projects: ProjectItem[],
  certificates: CertificateItem[],
  education: EducationItem[],
): string {
  const lines: string[] = [
    profile.name.toUpperCase(),
    `${profile.email}${profile.showPhone && profile.phone ? ` | ${profile.phone}` : ''} | ${profile.githubUrl} | ${profile.linkedinUrl}`,
    '',
    'SUMMARY',
    profile.heroSummary,
    profile.aboutBody,
    '',
    'SKILLS',
    ...skills
      .filter((s) => s.published)
      .map((s) => `${s.name}: ${s.items.join(', ')}`),
    '',
    'PROJECTS',
    ...projects
      .filter((p) => p.published)
      .flatMap((p) => [
        `${p.title} (${p.year}) — ${p.stack.join(', ')}`,
        `  • ${p.description}`,
        '',
      ]),
    'CERTIFICATES',
    ...certificates
      .filter((c) => c.published)
      .flatMap((c) => [
        `${c.title} — ${c.program} (${c.issuer}, Issued: ${c.issuedYear})`,
        `  • ${c.description}`,
        '',
      ]),
    'EDUCATION',
    ...education
      .filter((e) => e.published)
      .map(
        (e) =>
          `${e.degree} — ${e.institution} (${e.period}) | ${e.department} | CGPA: ${e.cgpa} | Status: ${e.status}`,
      ),
  ];
  return lines.join('\n');
}
