import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  FileText,
  Github,
  Linkedin,
  Mail,
  Send,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { ProjectCard } from './components/ProjectCard';
import { ProjectModal } from './components/ProjectModal';
import { ResumeModal } from './components/ResumeModal';
import { SceneCanvas, type SceneCanvasHandle } from './components/SceneCanvas';
import { SceneControlsDock } from './components/SceneControlsDock';
import {
  DEVELOPER_PROFILE,
  PROJECTS,
  TECH_STACK,
  type ProjectCategory,
  type ProjectItem,
} from './data/portfolioData';

const PROJECT_CATEGORIES: ProjectCategory[] = [
  'All',
  'Full-Stack',
  'AI Systems',
  'Infrastructure',
];

export default function App() {
  const sceneRef = useRef<SceneCanvasHandle | null>(null);

  const [isPaused, setIsPaused] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [activeSection, setActiveSection] = useState<string>('hero');
  const [selectedStackId, setSelectedStackId] = useState<string>(TECH_STACK[0].id);
  const [projectFilter, setProjectFilter] = useState<ProjectCategory>('All');
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);
  const [resumeOpen, setResumeOpen] = useState<boolean>(false);

  // Contact form & email copy state
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

  // Track visible section for subtle top-bar highlight
  useEffect(() => {
    const sectionIds = ['hero', 'about', 'stack', 'projects', 'contact'];
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0 || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-28% 0px -45% 0px', threshold: [0.1, 0.35, 0.6] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const selectedStack = useMemo(
    () => TECH_STACK.find((item) => item.id === selectedStackId) ?? TECH_STACK[0],
    [selectedStackId],
  );

  const filteredProjects = useMemo(() => {
    if (projectFilter === 'All') return PROJECTS;
    return PROJECTS.filter((p) => p.category === projectFilter);
  }, [projectFilter]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(DEVELOPER_PROFILE.email);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      // Fallback copy via temporary input if clipboard API is restricted
      const input = document.createElement('input');
      input.value = DEVELOPER_PROFILE.email;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 2200);
    }
  };

  const handleContactSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = formName.trim();
    const trimmedEmail = formEmail.trim();
    const trimmedMsg = formMessage.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMsg) {
      setFormError('Please complete your name, email address, and message.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    setFormError(null);
    setFormSubmitted(true);
  };

  const handleResetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormMessage('');
    setFormError(null);
    setFormSubmitted(false);
  };

  return (
    <div className="relative min-h-screen text-slate-100 overflow-x-clip">
      {/* Persistent Full-Bleed Procedural Three.js 3D Background */}
      <SceneCanvas ref={sceneRef} isPaused={isPaused} />

      {/* Top Navigation Bar (Strict 3-Zone Contract) */}
      <Navbar activeSection={activeSection} onOpenResume={() => setResumeOpen(true)} />

      {/* Semantic Foreground Portfolio Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-28 space-y-24 sm:space-y-32">
        {/* 1. HERO SECTION */}
        <section id="hero" className="min-h-[78vh] flex flex-col justify-center gap-12 sm:gap-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left glass panel — right 5 columns remain open for the rotating 3D geometric core */}
            <div className="lg:col-span-7 glass-panel rounded-2xl p-7 sm:p-10 space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-400">
                <span className="text-sky-300 font-medium">{DEVELOPER_PROFILE.role}</span>
                <span aria-hidden="true">·</span>
                <span>{DEVELOPER_PROFILE.location}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold tracking-tight text-white leading-[1.08]">
                {DEVELOPER_PROFILE.name}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-[58ch]">
                {DEVELOPER_PROFILE.heroSummary}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResumeOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f17]"
                >
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  <span>View Resume</span>
                </button>

                <a
                  href="#projects"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium text-slate-100 border border-white/15 hover:border-white/30 hover:bg-white/[0.05] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <span>Selected Projects</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Open viewport window on desktop allowing the glowing 3D geometric core to anchor the right half */}
            <div className="hidden lg:block lg:col-span-5 min-h-[320px]" aria-hidden="true" />
          </div>

          {/* Full-width 3-column quantitative proof strip below Hero split */}
          <div className="glass-panel-subtle rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
            {DEVELOPER_PROFILE.metrics.map((item, idx) => (
              <div
                key={item.value}
                className={idx === 0 ? 'space-y-1.5' : 'pt-5 md:pt-0 md:pl-8 space-y-1.5'}
              >
                <div className="font-mono text-2xl sm:text-3xl font-medium text-white tabular-nums">
                  {item.value}
                </div>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. ABOUT & TECH STACK SECTION */}
        <section id="about" className="space-y-10 scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Editorial About Card */}
            <div className="lg:col-span-5 glass-panel rounded-2xl p-7 sm:p-9 space-y-5">
              <div className="text-xs font-medium text-sky-300">01. About</div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                Engineering clarity from distributed storage to interactive pixels
              </h2>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {DEVELOPER_PROFILE.aboutLead}
              </p>
              <p className="text-sm text-slate-400 leading-relaxed">
                {DEVELOPER_PROFILE.aboutBody}
              </p>

              <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                <span>{DEVELOPER_PROFILE.availability}</span>
              </div>
            </div>

            {/* Interactive Tech Stack Explorer */}
            <div id="stack" className="lg:col-span-7 glass-panel rounded-2xl p-7 sm:p-9 space-y-6 scroll-mt-24">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-sky-300">02. Core Tech Stack</div>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                    Production Architecture Stack
                  </h2>
                </div>
                <span className="text-xs text-slate-400">Select a technology to inspect focus</span>
              </div>

              {/* 6 Interactive Stack Selector Buttons (React, Next.js, Node.js, MongoDB, TypeScript, AI) */}
              <div
                className="grid grid-cols-2 sm:grid-cols-3 gap-2.5"
                role="tablist"
                aria-label="Core technologies"
              >
                {TECH_STACK.map((tech) => {
                  const active = tech.id === selectedStack.id;
                  return (
                    <button
                      key={tech.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setSelectedStackId(tech.id)}
                      className={`text-left px-4 py-3.5 rounded-xl border transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                        active
                          ? 'bg-sky-400/[0.13] border-sky-400/55 text-white'
                          : 'bg-white/[0.02] border-white/[0.08] text-slate-300 hover:bg-white/[0.05] hover:border-white/20'
                      }`}
                    >
                      <div className="font-display text-base font-semibold whitespace-nowrap">
                        {tech.name}
                      </div>
                      <div className="mt-0.5 font-mono text-xs text-slate-400 tabular-nums whitespace-nowrap">
                        {tech.experience}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Technology Architectural Breakdown (separated by hairline divider, no nested card box) */}
              <div
                role="tabpanel"
                aria-label={`${selectedStack.name} capabilities`}
                className="pt-6 border-t border-white/10 space-y-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedStack.name}{' '}
                    <span className="text-slate-400 font-normal">· {selectedStack.domain}</span>
                  </h3>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">{selectedStack.summary}</p>

                <ul className="space-y-2 text-sm text-slate-300">
                  {selectedStack.capabilities.map((cap) => (
                    <li key={cap} className="flex items-start gap-2.5">
                      <span className="text-sky-400 select-none" aria-hidden="true">
                        —
                      </span>
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span>Applied in:</span>
                  {selectedStack.relatedProjectIds.map((projId) => {
                    const proj = PROJECTS.find((p) => p.id === projId);
                    if (!proj) return null;
                    return (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => setActiveProject(proj)}
                        className="text-sky-300 hover:text-sky-200 underline underline-offset-4 decoration-sky-400/40 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm"
                      >
                        {proj.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. INTERACTIVE PROJECTS SECTION */}
        <section id="projects" className="space-y-8 scroll-mt-24">
          <div className="glass-panel-subtle rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="text-xs font-medium text-sky-300">03. Selected Work</div>
              <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white">
                Featured Engineering Projects
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Select any project to inspect system architecture, measured production outcomes,
                and source repositories.
              </p>
            </div>

            {/* Interactive Segmented Category Filter */}
            <div
              className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] self-start md:self-auto"
              role="group"
              aria-label="Filter projects by category"
            >
              {PROJECT_CATEGORIES.map((category) => {
                const active = projectFilter === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setProjectFilter(category)}
                    aria-pressed={active}
                    className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                      active
                        ? 'bg-sky-400 text-slate-950 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isHighlighted={selectedStack.relatedProjectIds.includes(project.id)}
                onSelect={setActiveProject}
              />
            ))}
          </div>
        </section>

        {/* 4. CONTACT SECTION */}
        <section id="contact" className="scroll-mt-24">
          <div className="glass-panel rounded-2xl p-7 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            {/* Left Info & Direct Channels */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-8">
              <div className="space-y-4">
                <div className="text-xs font-medium text-sky-300">04. Contact</div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                  Let&apos;s build something built to last
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Open to principal full-stack engineering roles, architecture reviews, and
                  interactive web systems consulting.
                </p>
              </div>

              <div className="space-y-5 pt-6 border-t border-white/10">
                <div className="space-y-2">
                  <div className="text-xs text-slate-400">Direct Email</div>
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={`mailto:${DEVELOPER_PROFILE.email}`}
                      className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-slate-100 hover:text-sky-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm"
                    >
                      <Mail className="w-4 h-4 text-sky-400" aria-hidden="true" />
                      <span>{DEVELOPER_PROFILE.email}</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 border border-white/15 hover:border-sky-400/40 hover:bg-white/[0.05] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                    >
                      {copiedEmail ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-sky-300" aria-hidden="true" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-5 pt-1 text-sm text-slate-300">
                  <a
                    href={DEVELOPER_PROFILE.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm"
                  >
                    <Github className="w-4 h-4 text-slate-400" aria-hidden="true" />
                    <span>GitHub</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  </a>

                  <a
                    href={DEVELOPER_PROFILE.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm"
                  >
                    <Linkedin className="w-4 h-4 text-slate-400" aria-hidden="true" />
                    <span>LinkedIn</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Interactive Contact Form */}
            <div className="lg:col-span-7 lg:border-l lg:border-white/10 lg:pl-10">
              {formSubmitted ? (
                <div className="h-full flex flex-col justify-center items-start gap-4 py-6">
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-sky-400/15 border border-sky-400/40 text-sky-300">
                    <Check className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Message received</h3>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-md">
                    Thank you, {formName.trim()}. Your inquiry has been logged for{' '}
                    <span className="text-slate-100">{formEmail.trim()}</span>. I typically respond
                    within one business day.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="mt-2 px-4 py-2.5 rounded-lg text-xs font-medium text-slate-200 border border-white/15 hover:bg-white/[0.06] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} noValidate className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="contact-name" className="block text-xs font-medium text-slate-300">
                        Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        autoComplete="name"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Alex Rivera"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#090d14]/90 border border-white/12 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="contact-email" className="block text-xs font-medium text-slate-300">
                        Email
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        autoComplete="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="alex@company.com"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#090d14]/90 border border-white/12 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-message" className="block text-xs font-medium text-slate-300">
                      Project or Inquiry
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                      placeholder="Share scope, timeline, or technical goals..."
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#090d14]/90 border border-white/12 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-colors resize-y"
                    />
                  </div>

                  {formError && (
                    <p role="alert" className="text-xs font-medium text-amber-300">
                      {formError}
                    </p>
                  )}

                  <div className="pt-1 flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-400">
                      Direct reply within 24 hours
                    </span>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                    >
                      <Send className="w-4 h-4" aria-hidden="true" />
                      <span>Send Message</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Minimal Quiet Footer */}
        <footer className="pt-4 pb-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            © 2026 {DEVELOPER_PROFILE.name}. Crafted with Three.js, React, and Tailwind CSS.
          </div>
          <a
            href="#hero"
            className="text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm"
          >
            Back to top
          </a>
        </footer>
      </main>

      {/* Collapsible Floating 3D Controls Dock (Pause/Resume Motion, Rotate, Reset) */}
      <SceneControlsDock
        isPaused={isPaused}
        onTogglePause={() => setIsPaused((prev) => !prev)}
        onNudgeOrbit={() => sceneRef.current?.nudgeOrbit()}
        onResetView={() => sceneRef.current?.resetView()}
      />

      {/* Interactive Modals */}
      <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
      <ResumeModal open={resumeOpen} onClose={() => setResumeOpen(false)} />
    </div>
  );
}
