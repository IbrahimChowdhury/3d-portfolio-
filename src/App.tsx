import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Check,
  Copy,
  FileText,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  Phone,
  Send,
  Sliders,
} from 'lucide-react';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Navbar } from './components/Navbar';
import { ProjectCard } from './components/ProjectCard';
import { ProjectModal } from './components/ProjectModal';
import { ResumeModal } from './components/ResumeModal';
import { SceneCanvas, type SceneCanvasHandle } from './components/SceneCanvas';
import { SceneControlsDock } from './components/SceneControlsDock';
import { usePortfolio } from './context/PortfolioContext';
import type { AccentTheme, ProjectCategory, ProjectItem } from './data/portfolioData';

const PROJECT_CATEGORIES: ProjectCategory[] = ['All', 'Full-Stack', 'AI Systems', 'Platform'];

const ACCENT_TOKENS: Record<
  AccentTheme,
  {
    text: string;
    cta: string;
    tabActive: string;
    filterActive: string;
    iconBox: string;
  }
> = {
  sapphire: {
    text: 'text-sky-300',
    cta: 'bg-sky-400 hover:bg-sky-300 text-slate-950 focus-visible:ring-sky-300',
    tabActive: 'bg-sky-400/[0.13] border-sky-400/55 text-white',
    filterActive: 'bg-sky-400 text-slate-950 font-semibold',
    iconBox: 'bg-sky-400/15 border-sky-400/40 text-sky-300',
  },
  emerald: {
    text: 'text-emerald-300',
    cta: 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 focus-visible:ring-emerald-300',
    tabActive: 'bg-emerald-400/[0.13] border-emerald-400/55 text-white',
    filterActive: 'bg-emerald-400 text-slate-950 font-semibold',
    iconBox: 'bg-emerald-400/15 border-emerald-400/40 text-emerald-300',
  },
  amber: {
    text: 'text-amber-300',
    cta: 'bg-amber-400 hover:bg-amber-300 text-slate-950 focus-visible:ring-amber-300',
    tabActive: 'bg-amber-400/[0.13] border-amber-400/55 text-white',
    filterActive: 'bg-amber-400 text-slate-950 font-semibold',
    iconBox: 'bg-amber-400/15 border-amber-400/40 text-amber-300',
  },
};

export default function App() {
  const {
    profile,
    skills,
    projects,
    certificates,
    education,
    submitContactMessage,
  } = usePortfolio();

  const sceneRef = useRef<SceneCanvasHandle | null>(null);

  const [viewMode, setViewMode] = useState<'portfolio' | 'admin'>(() =>
    typeof window !== 'undefined' && window.location.hash === '#admin' ? 'admin' : 'portfolio',
  );

  const [isPaused, setIsPaused] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [activeSection, setActiveSection] = useState<string>('hero');
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [projectFilter, setProjectFilter] = useState<ProjectCategory>('All');
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);
  const [resumeOpen, setResumeOpen] = useState<boolean>(false);

  // Contact form state
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

  // Sync URL hash for direct #admin bookmarking
  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#admin') {
        setViewMode('admin');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const openAdmin = () => {
    setViewMode('admin');
    window.history.replaceState(null, '', '#admin');
    window.scrollTo({ top: 0 });
  };

  const exitAdmin = () => {
    setViewMode('portfolio');
    window.history.replaceState(null, '', '#hero');
    window.scrollTo({ top: 0 });
  };

  // Filtered public lists
  const publishedSkills = useMemo(() => skills.filter((s) => s.published), [skills]);
  const publishedProjects = useMemo(() => projects.filter((p) => p.published), [projects]);
  const publishedCertificates = useMemo(
    () => certificates.filter((c) => c.published),
    [certificates],
  );
  const publishedEducation = useMemo(
    () => education.filter((e) => e.published),
    [education],
  );

  const selectedSkill = useMemo(
    () =>
      publishedSkills.find((s) => s.id === selectedSkillId) ??
      publishedSkills[0] ??
      null,
    [publishedSkills, selectedSkillId],
  );

  const filteredProjects = useMemo(() => {
    if (projectFilter === 'All') return publishedProjects;
    return publishedProjects.filter((p) => p.category === projectFilter);
  }, [publishedProjects, projectFilter]);

  // Track visible homepage section for nav underline
  useEffect(() => {
    if (viewMode !== 'portfolio') return;
    const sectionIds = ['hero', 'about', 'skills', 'projects', 'credentials', 'contact'];
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
  }, [viewMode, profile.sectionVisibility]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      const input = document.createElement('input');
      input.value = profile.email;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 2200);
    }
  };

  const handleContactSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = formName.trim();
    const trimmedEmail = formEmail.trim();
    const trimmedSubject = formSubject.trim() || 'Portfolio Inquiry';
    const trimmedMsg = formMessage.trim();

    if (trimmedName.length < 2 || !trimmedEmail || trimmedMsg.length < 5) {
      setFormError('Please provide your name, a valid email, and a message (at least 5 characters).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    setFormError(null);
    setFormSubmitting(true);
    try {
      await submitContactMessage({
        name: trimmedName,
        email: trimmedEmail,
        subject: trimmedSubject,
        message: trimmedMsg,
      });
      setFormSubmitted(true);
    } catch {
      setFormError('Unable to send message right now. Please email directly.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormSubject('');
    setFormMessage('');
    setFormError(null);
    setFormSubmitted(false);
  };

  if (viewMode === 'admin') {
    return <AdminDashboard onExitAdmin={exitAdmin} />;
  }

  const accent = ACCENT_TOKENS[profile.sceneSettings.accentTheme] ?? ACCENT_TOKENS.sapphire;
  const showCredentials =
    (profile.sectionVisibility.certificates && publishedCertificates.length > 0) ||
    (profile.sectionVisibility.education && publishedEducation.length > 0);

  return (
    <div className="relative min-h-screen text-slate-100 overflow-x-clip">
      {/* Persistent Full-Bleed Procedural Three.js 3D Scene (live-controlled by Admin Dashboard) */}
      <SceneCanvas
        ref={sceneRef}
        isPaused={isPaused}
        sceneSettings={profile.sceneSettings}
      />

      {/* Top Navigation Bar (Strict 3-Zone Contract) */}
      <Navbar
        profile={profile}
        activeSection={activeSection}
        onOpenResume={() => setResumeOpen(true)}
        onOpenAdmin={openAdmin}
      />

      {/* Semantic Foreground Portfolio Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-28 space-y-24 sm:space-y-32">
        {/* 1. UPGRADED HERO SECTION */}
        <section id="hero" className="min-h-[78vh] flex flex-col justify-center gap-12 sm:gap-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left glass panel — right 5 columns remain open for the rotating 3D geometric core */}
            <div className="lg:col-span-7 glass-panel rounded-2xl p-7 sm:p-10 space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-400">
                <span className={`font-medium ${accent.text}`}>{profile.role}</span>
                <span aria-hidden="true">·</span>
                <span>{profile.location}</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold tracking-tight text-white leading-[1.06]">
                  {profile.name}
                </h1>
                <p className="font-display text-lg sm:text-xl font-medium text-slate-200 leading-snug max-w-[46ch]">
                  {profile.headline}
                </p>
              </div>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-[58ch]">
                {profile.heroSummary}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResumeOpen(true)}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f17] ${accent.cta}`}
                >
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  <span>View & Download CV</span>
                </button>

                {profile.sectionVisibility.projects && (
                  <a
                    href="#projects"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium text-slate-100 border border-white/15 hover:border-white/30 hover:bg-white/[0.05] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  >
                    <span>Explore Projects</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>

            {/* Open viewport window on desktop allowing the glowing 3D geometric core to anchor the right half */}
            <div className="hidden lg:block lg:col-span-5 min-h-[320px]" aria-hidden="true" />
          </div>

          {/* Full-width quantitative proof strip below Hero split */}
          {profile.metrics.length > 0 && (
            <div className="glass-panel-subtle rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
              {profile.metrics.map((item, idx) => (
                <div
                  key={`${item.value}-${idx}`}
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
          )}
        </section>

        {/* 2. ABOUT & INTERACTIVE CV TECH STACK SECTION */}
        {(profile.sectionVisibility.about || profile.sectionVisibility.skills) && (
          <section id="about" className="scroll-mt-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {profile.sectionVisibility.about && (
                <div
                  className={`${
                    profile.sectionVisibility.skills ? 'lg:col-span-5' : 'lg:col-span-12'
                  } glass-panel rounded-2xl p-7 sm:p-9 space-y-5`}
                >
                  <div className={`text-xs font-medium ${accent.text}`}>01. About</div>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                    Full-stack architecture paired with AI-assisted velocity
                  </h2>
                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                    {profile.aboutLead}
                  </p>
                  <p className="text-sm text-slate-400 leading-relaxed">{profile.aboutBody}</p>

                  <div className="pt-4 border-t border-white/[0.08] space-y-2 text-xs text-slate-400">
                    <div>{profile.availability}</div>
                    {profile.resumeUrl && (
                      <a
                        href={profile.resumeUrl}
                        download="Ibrahim_Chowdhury_CV.pdf"
                        className={`inline-flex items-center gap-1.5 font-medium underline underline-offset-4 ${accent.text}`}
                      >
                        <span>Download full PDF curriculum vitae</span>
                        <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {profile.sectionVisibility.skills && publishedSkills.length > 0 && (
                <div
                  id="skills"
                  className={`${
                    profile.sectionVisibility.about ? 'lg:col-span-7' : 'lg:col-span-12'
                  } glass-panel rounded-2xl p-7 sm:p-9 space-y-6 scroll-mt-24`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div className="space-y-1">
                      <div className={`text-xs font-medium ${accent.text}`}>
                        02. Technical Skills
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                        Full-Stack & AI Tooling Matrix
                      </h2>
                    </div>
                    <span className="text-xs text-slate-400 font-mono tabular-nums">
                      {publishedSkills.length} domains
                    </span>
                  </div>

                  {/* Interactive Category Selector Tabs */}
                  <div
                    className="grid grid-cols-2 sm:grid-cols-3 gap-2.5"
                    role="tablist"
                    aria-label="Skill categories"
                  >
                    {publishedSkills.map((group) => {
                      const active = selectedSkill?.id === group.id;
                      return (
                        <button
                          key={group.id}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setSelectedSkillId(group.id)}
                          className={`text-left px-3.5 py-3 rounded-xl border transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                            active
                              ? accent.tabActive
                              : 'bg-white/[0.02] border-white/[0.08] text-slate-300 hover:bg-white/[0.05] hover:border-white/20'
                          }`}
                        >
                          <div className="font-display text-sm font-semibold truncate">
                            {group.name}
                          </div>
                          <div className="mt-0.5 font-mono text-[11px] text-slate-400 tabular-nums truncate">
                            {group.items.length} skills · {group.experience}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Skill Category Breakdown (unboxed metadata, hairline divider) */}
                  {selectedSkill && (
                    <div
                      role="tabpanel"
                      aria-label={`${selectedSkill.name} skills`}
                      className="pt-6 border-t border-white/10 space-y-4"
                    >
                      <h3 className="text-lg font-semibold text-white">
                        {selectedSkill.name}{' '}
                        <span className="text-slate-400 font-normal">
                          · {selectedSkill.domain}
                        </span>
                      </h3>

                      <p className="text-sm text-slate-300 leading-relaxed">
                        {selectedSkill.summary}
                      </p>

                      <div className="pt-2 space-y-1.5">
                        <div className="text-xs text-slate-400">Technologies & Capabilities</div>
                        <div className="text-sm sm:text-[15px] text-slate-100 leading-relaxed">
                          {selectedSkill.items.join(' · ')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 3. INTERACTIVE PROJECTS SECTION */}
        {profile.sectionVisibility.projects && (
          <section id="projects" className="space-y-8 scroll-mt-24">
            <div className="glass-panel-subtle rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className={`text-xs font-medium ${accent.text}`}>03. Selected Work</div>
                <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white">
                  Featured Engineering Projects
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Real-world web applications built with React, Next.js, Node.js, MongoDB, and
                  Supabase. Click any card for architecture notes and links.
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
                          ? accent.filterActive
                          : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredProjects.length === 0 ? (
              <div className="glass-panel-subtle rounded-2xl p-10 text-center text-sm text-slate-400">
                No published projects in this category yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    accentTheme={profile.sceneSettings.accentTheme}
                    onSelect={setActiveProject}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* 4. CREDENTIALS SECTION: EDUCATION & VERIFIED CERTIFICATES */}
        {showCredentials && (
          <section id="credentials" className="scroll-mt-24 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {profile.sectionVisibility.education && publishedEducation.length > 0 && (
                <div
                  className={`${
                    profile.sectionVisibility.certificates && publishedCertificates.length > 0
                      ? 'lg:col-span-5'
                      : 'lg:col-span-12'
                  } glass-panel rounded-2xl p-7 sm:p-9 flex flex-col justify-between gap-6`}
                >
                  <div className="space-y-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`text-xs font-medium ${accent.text}`}>04. Education</span>
                      <GraduationCap className="w-4 h-4 text-slate-400" aria-hidden="true" />
                    </div>

                    <h2 className="text-2xl font-semibold tracking-tight text-white">
                      Academic Foundation
                    </h2>

                    <div className="space-y-6 divide-y divide-white/[0.08]">
                      {publishedEducation.map((edu, idx) => (
                        <div key={edu.id} className={idx === 0 ? 'space-y-2' : 'pt-6 space-y-2'}>
                          <div className="font-mono text-xs text-slate-400 tabular-nums">
                            {edu.period}
                          </div>
                          <h3 className="text-lg font-semibold text-white leading-snug">
                            {edu.degree}
                          </h3>
                          <div className="text-sm text-slate-200">{edu.institution}</div>
                          <div className="text-xs text-slate-400">{edu.department}</div>
                          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-300 font-mono tabular-nums">
                            {edu.cgpa && <span className={accent.text}>CGPA: {edu.cgpa}</span>}
                            {edu.cgpa && edu.status && <span aria-hidden="true">·</span>}
                            {edu.status && <span>Status: {edu.status}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {profile.sectionVisibility.certificates && publishedCertificates.length > 0 && (
                <div
                  className={`${
                    profile.sectionVisibility.education && publishedEducation.length > 0
                      ? 'lg:col-span-7'
                      : 'lg:col-span-12'
                  } glass-panel rounded-2xl p-7 sm:p-9 space-y-5`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-xs font-medium ${accent.text}`}>
                      05. Verified Certificates
                    </span>
                    <Award className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  </div>

                  <h2 className="text-2xl font-semibold tracking-tight text-white">
                    Technical Certifications & Assessments
                  </h2>

                  <div className="divide-y divide-white/[0.08]">
                    {publishedCertificates.map((cert, idx) => (
                      <div
                        key={cert.id}
                        className={idx === 0 ? 'pb-5 space-y-2' : 'pt-5 pb-5 last:pb-0 space-y-2'}
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <div className="text-xs text-slate-400">
                            {cert.issuer} ·{' '}
                            <span className="font-mono tabular-nums">
                              Issued {cert.issuedYear}
                            </span>
                          </div>
                          {cert.credentialUrl && (
                            <a
                              href={cert.credentialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${accent.text}`}
                            >
                              <span>View Certificate</span>
                              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                            </a>
                          )}
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-white">
                          {cert.title}{' '}
                          <span className="text-slate-400 font-normal">· {cert.program}</span>
                        </h3>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {cert.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 5. CONTACT SECTION (Live Firestore Inbox Connected) */}
        {profile.sectionVisibility.contact && (
          <section id="contact" className="scroll-mt-24">
            <div className="glass-panel rounded-2xl p-7 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
              <div className="lg:col-span-5 flex flex-col justify-between gap-8">
                <div className="space-y-4">
                  <div className={`text-xs font-medium ${accent.text}`}>06. Contact</div>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                    Let&apos;s build your next web platform together
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    {profile.availability}. Messages submitted here go directly into my private
                    admin inbox.
                  </p>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/10">
                  <div className="space-y-2">
                    <div className="text-xs text-slate-400">Direct Email</div>
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href={`mailto:${profile.email}`}
                        className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-slate-100 hover:text-white transition-colors"
                      >
                        <Mail className={`w-4 h-4 ${accent.text}`} aria-hidden="true" />
                        <span>{profile.email}</span>
                      </a>

                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 border border-white/15 hover:bg-white/[0.05] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        {copiedEmail ? (
                          <>
                            <Check className={`w-3.5 h-3.5 ${accent.text}`} aria-hidden="true" />
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

                  {profile.showPhone && profile.phone && (
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400">Phone</div>
                      <a
                        href={`tel:${profile.phone}`}
                        className="inline-flex items-center gap-2 text-sm font-mono tabular-nums text-slate-200 hover:text-white transition-colors"
                      >
                        <Phone className="w-4 h-4 text-slate-400" aria-hidden="true" />
                        <span>{profile.phone}</span>
                      </a>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-5 pt-2 text-sm text-slate-300">
                    {profile.githubUrl && (
                      <a
                        href={profile.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0"
                      >
                        <Github className="w-4 h-4 text-slate-400" aria-hidden="true" />
                        <span>GitHub</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                      </a>
                    )}

                    {profile.linkedinUrl && (
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0"
                      >
                        <Linkedin className="w-4 h-4 text-slate-400" aria-hidden="true" />
                        <span>LinkedIn</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Firestore-Connected Contact Form */}
              <div className="lg:col-span-7 lg:border-l lg:border-white/10 lg:pl-10">
                {formSubmitted ? (
                  <div className="h-full flex flex-col justify-center items-start gap-4 py-6">
                    <div
                      className={`inline-flex items-center justify-center w-11 h-11 rounded-xl border ${accent.iconBox}`}
                    >
                      <Check className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Message delivered</h3>
                    <p className="text-sm text-slate-300 leading-relaxed max-w-md">
                      Thank you, {formName.trim()}. Your message has been saved to{' '}
                      {profile.name}&apos;s inbox and we will reply to{' '}
                      <span className="text-slate-100">{formEmail.trim()}</span> shortly.
                    </p>
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="mt-2 px-4 py-2.5 rounded-lg text-xs font-medium text-slate-200 border border-white/15 hover:bg-white/[0.06] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} noValidate className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="contact-name"
                          className="block text-xs font-medium text-slate-300"
                        >
                          Name
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          autoComplete="name"
                          maxLength={100}
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="Your name"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#090d14]/90 border border-white/12 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label
                          htmlFor="contact-email"
                          className="block text-xs font-medium text-slate-300"
                        >
                          Email
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          autoComplete="email"
                          maxLength={140}
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          placeholder="you@company.com"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#090d14]/90 border border-white/12 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="contact-subject"
                        className="block text-xs font-medium text-slate-300"
                      >
                        Subject
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        maxLength={140}
                        value={formSubject}
                        onChange={(e) => setFormSubject(e.target.value)}
                        placeholder="Full-stack project, hiring inquiry, or collaboration"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#090d14]/90 border border-white/12 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="contact-message"
                        className="block text-xs font-medium text-slate-300"
                      >
                        Message
                      </label>
                      <textarea
                        id="contact-message"
                        rows={4}
                        maxLength={2000}
                        value={formMessage}
                        onChange={(e) => setFormMessage(e.target.value)}
                        placeholder="Share your goals, timeline, or role details..."
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
                        Delivered directly to admin inbox
                      </span>

                      <button
                        type="submit"
                        disabled={formSubmitting}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 ${accent.cta}`}
                      >
                        <Send className="w-4 h-4" aria-hidden="true" />
                        <span>{formSubmitting ? 'Sending...' : 'Send Message'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Minimal Quiet Footer */}
        <footer className="pt-4 pb-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>© 2026 {profile.name}. Built with Three.js, React, Tailwind CSS, and Firebase.</div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={openAdmin}
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>Admin Dashboard</span>
            </button>
            <a
              href="#hero"
              className="text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Back to top
            </a>
          </div>
        </footer>
      </main>

      {/* Collapsible Floating 3D Controls Dock */}
      <SceneControlsDock
        isPaused={isPaused}
        onTogglePause={() => setIsPaused((prev) => !prev)}
        onNudgeOrbit={() => sceneRef.current?.nudgeOrbit()}
        onResetView={() => sceneRef.current?.resetView()}
      />

      {/* Interactive Modals */}
      <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
      <ResumeModal
        open={resumeOpen}
        onClose={() => setResumeOpen(false)}
        profile={profile}
        skills={skills}
        projects={projects}
        certificates={certificates}
        education={education}
      />
    </div>
  );
}
