import { useState } from 'react';
import {
  ArrowLeft,
  Award,
  Check,
  Code2,
  Database,
  ExternalLink,
  FolderKanban,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldAlert,
  Sliders,
  User,
  X,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { BOOTSTRAP_ADMIN_EMAIL } from '../../firebase/config';
import type { AccentTheme, SectionVisibility } from '../../data/portfolioData';
import { MessagesInbox } from './MessagesInbox';
import { ProfileEditor } from './ProfileEditor';
import { ProjectsManager } from './ProjectsManager';
import {
  CertificatesManager,
  EducationManager,
  SkillsManager,
} from './SkillsCredentialsManager';

type AdminTab =
  | 'overview'
  | 'profile'
  | 'projects'
  | 'skills'
  | 'certificates'
  | 'education'
  | 'inbox'
  | 'site';

interface AdminDashboardProps {
  onExitAdmin: () => void;
}

const TAB_META: Record<AdminTab, { label: string; description: string }> = {
  overview: {
    label: 'Overview',
    description: 'Live portfolio inventory, section switches, and recent visitor inquiries.',
  },
  profile: {
    label: 'Profile & Hero',
    description: 'Update your name, role, headline, bio, social links, CV file, and proof metrics.',
  },
  projects: {
    label: 'Projects',
    description: 'Create, edit, feature, publish, or remove engineering portfolio projects.',
  },
  skills: {
    label: 'Skills & Stack',
    description: 'Manage technical skill categories and tool lists synced to the homepage.',
  },
  certificates: {
    label: 'Certificates',
    description: 'Add and verify completion and assessment credentials.',
  },
  education: {
    label: 'Education',
    description: 'Maintain academic degrees, CGPA, and institution milestones.',
  },
  inbox: {
    label: 'Inbox',
    description: 'Read, archive, and respond to private contact inquiries stored in Firestore.',
  },
  site: {
    label: 'Site & 3D Controls',
    description: 'Toggle homepage sections and customize the live procedural Three.js scene.',
  },
};

export function AdminDashboard({ onExitAdmin }: AdminDashboardProps) {
  const {
    user,
    authReady,
    isAdmin,
    authError,
    signInWithGoogle,
    signOutUser,
    profile,
    skills,
    projects,
    certificates,
    education,
    messages,
    isSyncing,
    lastSavedMessage,
    saveProfile,
    seedFromCV,
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const unreadCount = messages.filter((m) => m.status === 'unread').length;
  const publishedProjectsCount = projects.filter((p) => p.published).length;

  const toggleSection = async (key: keyof SectionVisibility) => {
    await saveProfile({
      ...profile,
      sectionVisibility: {
        ...profile.sectionVisibility,
        [key]: !profile.sectionVisibility[key],
      },
    });
  };

  const updateSceneSetting = async (patch: Partial<typeof profile.sceneSettings>) => {
    await saveProfile({
      ...profile,
      sceneSettings: {
        ...profile.sceneSettings,
        ...patch,
      },
    });
  };

  // Loading auth gate
  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#07090d] text-slate-200 flex items-center justify-center p-6">
        <div className="text-sm text-slate-400">Checking administrator session...</div>
      </div>
    );
  }

  // Unauthenticated or unauthorized gate
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#07090d] text-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d121c] p-8 space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-medium text-sky-400">Portfolio Admin Console</div>
            <h1 className="font-display text-2xl font-semibold text-white">
              {user ? 'Owner Access Required' : 'Sign in to manage your portfolio'}
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              {user
                ? `Signed in as ${user.email}. Admin controls are restricted to ${BOOTSTRAP_ADMIN_EMAIL}.`
                : `Sign in with your verified Google account (${BOOTSTRAP_ADMIN_EMAIL}) to edit projects, skills, credentials, 3D scene settings, and read visitor messages.`}
            </p>
          </div>

          {user && !isAdmin && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-start gap-3 text-xs text-amber-200">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Please sign out and authenticate with the portfolio owner account to unlock write
                permissions.
              </span>
            </div>
          )}

          {authError && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
              {authError}
            </div>
          )}

          <div className="space-y-3 pt-1">
            {!user ? (
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 transition-colors cursor-pointer"
              >
                Continue with Google
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void signOutUser()}
                className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 transition-colors cursor-pointer"
              >
                Switch Account
              </button>
            )}

            <button
              type="button"
              onClick={onExitAdmin}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium text-slate-300 border border-white/12 hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back to Public Portfolio</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems: {
    id: AdminTab;
    label: string;
    icon: typeof LayoutDashboard;
    count?: number;
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile & Hero', icon: User },
    { id: 'projects', label: 'Projects', icon: FolderKanban, count: projects.length },
    { id: 'skills', label: 'Skills & Stack', icon: Code2, count: skills.length },
    { id: 'certificates', label: 'Certificates', icon: Award, count: certificates.length },
    { id: 'education', label: 'Education', icon: GraduationCap, count: education.length },
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: unreadCount },
    { id: 'site', label: 'Site & 3D Controls', icon: Sliders },
  ];

  const renderSidebarContent = () => (
    <div className="h-full flex flex-col justify-between bg-[#0a0e16] border-r border-white/10">
      <div>
        <div className="h-14 px-5 flex items-center justify-between border-b border-white/10">
          <div className="min-w-0">
            <div className="font-display text-sm font-semibold text-white truncate">
              Portfolio CMS
            </div>
            <div className="text-[11px] text-slate-400 truncate">{profile.name}</div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Admin sections" className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-sky-400/[0.14] text-sky-300'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </span>
                {typeof item.count === 'number' && (
                  <span
                    className={`font-mono text-xs tabular-nums ${
                      item.id === 'inbox' && item.count > 0
                        ? 'text-sky-300 font-semibold'
                        : 'text-slate-500'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="text-xs text-slate-400 truncate">{user.email}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExitAdmin}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 border border-white/12 hover:bg-white/[0.05] cursor-pointer whitespace-nowrap"
          >
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Live Site</span>
          </button>
          <button
            type="button"
            onClick={() => void signOutUser()}
            title="Sign out"
            className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 border border-white/12 hover:text-white hover:bg-white/[0.05] cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-100 flex">
      {/* Desktop Fixed Sidebar (256px) */}
      <aside className="hidden lg:block w-64 shrink-0 fixed inset-y-0 left-0 z-30">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Slide-Over Sidebar */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/70"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="w-64 h-full" onClick={(e) => e.stopPropagation()}>
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Workspace Bar */}
        <header className="sticky top-0 z-20 h-14 px-4 sm:px-8 bg-[#090c12]/95 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open admin menu"
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-white/[0.05] cursor-pointer"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm truncate">
              <span className="text-slate-400 hidden sm:inline">Portfolio CMS</span>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <span className="font-medium text-white truncate">
                {TAB_META[activeTab].label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {lastSavedMessage && (
              <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 whitespace-nowrap">
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{lastSavedMessage}</span>
              </div>
            )}

            <button
              type="button"
              onClick={onExitAdmin}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              <span>View Homepage</span>
            </button>
          </div>
        </header>

        {/* Main Workspace Content */}
        <main className="flex-1 p-5 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-white">
              {TAB_META[activeTab].label}
            </h1>
            <p className="text-sm text-slate-400">{TAB_META[activeTab].description}</p>
          </div>

          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Structured KPI Stat Strip (flat 1px border, zero nested cards) */}
              <div className="rounded-xl border border-white/10 bg-[#0d121c] grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
                <div className="p-5 space-y-1">
                  <div className="text-xs text-slate-400">Published Projects</div>
                  <div className="font-mono text-2xl font-semibold text-white tabular-nums">
                    {publishedProjectsCount}{' '}
                    <span className="text-sm font-normal text-slate-500">/ {projects.length}</span>
                  </div>
                </div>
                <div className="p-5 space-y-1">
                  <div className="text-xs text-slate-400">Skill Categories</div>
                  <div className="font-mono text-2xl font-semibold text-white tabular-nums">
                    {skills.length}
                  </div>
                </div>
                <div className="p-5 space-y-1">
                  <div className="text-xs text-slate-400">Credentials & Degrees</div>
                  <div className="font-mono text-2xl font-semibold text-white tabular-nums">
                    {certificates.length + education.length}
                  </div>
                </div>
                <div className="p-5 space-y-1">
                  <div className="text-xs text-slate-400">Unread Inquiries</div>
                  <div className="font-mono text-2xl font-semibold text-sky-400 tabular-nums">
                    {unreadCount}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Quick Section Toggles */}
                <div className="lg:col-span-6 rounded-xl border border-white/10 bg-[#0d121c] p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-white">Homepage Sections</h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab('site')}
                      className="text-xs text-sky-400 hover:text-sky-300 cursor-pointer"
                    >
                      3D Settings
                    </button>
                  </div>

                  <div className="divide-y divide-white/[0.06]">
                    {(
                      [
                        ['about', 'About Narrative'],
                        ['skills', 'Interactive Skills & Tech Stack'],
                        ['projects', 'Featured Projects Grid'],
                        ['certificates', 'Verified Certificates'],
                        ['education', 'Academic Education'],
                        ['contact', 'Contact Form & Channels'],
                      ] as const
                    ).map(([key, label]) => {
                      const enabled = profile.sectionVisibility[key];
                      return (
                        <div key={key} className="py-3 flex items-center justify-between gap-4">
                          <span className="text-sm text-slate-200">{label}</span>
                          <button
                            type="button"
                            disabled={isSyncing}
                            onClick={() => void toggleSection(key)}
                            aria-pressed={enabled}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                              enabled
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-white/[0.04] text-slate-400 border border-white/10'
                            }`}
                          >
                            {enabled ? 'Visible' : 'Hidden'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Inquiries & CV Sync */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="rounded-xl border border-white/10 bg-[#0d121c] p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-white">Recent Visitor Inquiries</h2>
                      <button
                        type="button"
                        onClick={() => setActiveTab('inbox')}
                        className="text-xs text-sky-400 hover:text-sky-300 cursor-pointer"
                      >
                        Open Inbox
                      </button>
                    </div>

                    {messages.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3">
                        No contact messages yet. Submissions from your homepage appear here live.
                      </p>
                    ) : (
                      <div className="divide-y divide-white/[0.06]">
                        {messages.slice(0, 3).map((m) => (
                          <div key={m.id} className="py-2.5 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm text-white truncate">{m.name}</div>
                              <div className="text-xs text-slate-400 truncate">{m.subject}</div>
                            </div>
                            <span
                              className={`text-xs capitalize shrink-0 ${
                                m.status === 'unread' ? 'text-sky-400 font-medium' : 'text-slate-500'
                              }`}
                            >
                              {m.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#0d121c] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-white">CV Baseline Sync</div>
                      <p className="text-xs text-slate-400">
                        Re-import Ibrahim Chowdhury&apos;s baseline CV data into Firestore.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isSyncing}
                      onClick={() => void seedFromCV()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-slate-100 border border-white/15 hover:bg-white/[0.06] cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Database className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
                      <span>{isSyncing ? 'Syncing...' : 'Sync CV to Cloud'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. PROFILE & HERO */}
          {activeTab === 'profile' && <ProfileEditor />}

          {/* 3. PROJECTS */}
          {activeTab === 'projects' && <ProjectsManager />}

          {/* 4. SKILLS */}
          {activeTab === 'skills' && <SkillsManager />}

          {/* 5. CERTIFICATES */}
          {activeTab === 'certificates' && <CertificatesManager />}

          {/* 6. EDUCATION */}
          {activeTab === 'education' && <EducationManager />}

          {/* 7. INBOX */}
          {activeTab === 'inbox' && <MessagesInbox />}

          {/* 8. SITE & 3D CONTROLS */}
          {activeTab === 'site' && (
            <div className="space-y-6 max-w-3xl">
              {/* Live 3D Scene Controls */}
              <section className="rounded-xl border border-white/10 bg-[#0d121c] p-6 space-y-6">
                <div className="border-b border-white/[0.08] pb-4">
                  <h2 className="text-base font-semibold text-white">
                    Procedural Three.js Scene Controls
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Changes save directly to Firestore and update the live 3D geometric core and
                    accent lighting for every visitor.
                  </p>
                </div>

                {/* Accent Palette Selector */}
                <div className="space-y-2.5">
                  <div className="text-xs font-medium text-slate-300">
                    3D Core & Homepage Accent Palette
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(
                      [
                        { id: 'sapphire', label: 'Electric Sapphire', swatch: 'bg-sky-400' },
                        { id: 'emerald', label: 'Precision Emerald', swatch: 'bg-emerald-400' },
                        { id: 'amber', label: 'Warm Champagne', swatch: 'bg-amber-400' },
                      ] as { id: AccentTheme; label: string; swatch: string }[]
                    ).map((theme) => {
                      const active = profile.sceneSettings.accentTheme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          disabled={isSyncing}
                          onClick={() => void updateSceneSetting({ accentTheme: theme.id })}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors cursor-pointer ${
                            active
                              ? 'border-sky-400 bg-sky-400/10 text-white'
                              : 'border-white/10 bg-[#07090d] text-slate-300 hover:border-white/25'
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-sm shrink-0 ${theme.swatch}`}
                            aria-hidden="true"
                          />
                          <span className="text-xs font-medium">{theme.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Core Rotation Speed */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">Geometric Core Rotation Speed</span>
                    <span className="font-mono text-sky-300 tabular-nums">
                      {profile.sceneSettings.coreSpeed.toFixed(1)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={2.2}
                    step={0.2}
                    value={profile.sceneSettings.coreSpeed}
                    onChange={(e) =>
                      void updateSceneSetting({ coreSpeed: Number(e.target.value) })
                    }
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                </div>

                {/* Particle Field Toggle */}
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/[0.08]">
                  <div>
                    <div className="text-sm font-medium text-white">Interactive Particle Field</div>
                    <div className="text-xs text-slate-400">
                      Render the 1,350-point reactive starfield orbiting behind the glass cards.
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={() =>
                      void updateSceneSetting({
                        showParticles: !profile.sceneSettings.showParticles,
                      })
                    }
                    className={`px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                      profile.sceneSettings.showParticles
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/[0.04] text-slate-400 border border-white/10'
                    }`}
                  >
                    {profile.sceneSettings.showParticles ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </section>

              {/* Section Visibility Matrix */}
              <section className="rounded-xl border border-white/10 bg-[#0d121c] p-6 space-y-4">
                <div className="border-b border-white/[0.08] pb-4">
                  <h2 className="text-base font-semibold text-white">Section Visibility</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Instantly show or hide any section on your live homepage.
                  </p>
                </div>

                <div className="divide-y divide-white/[0.06]">
                  {(
                    [
                      ['about', 'About Narrative'],
                      ['skills', 'Skills & Tech Stack'],
                      ['projects', 'Projects Showcase'],
                      ['certificates', 'Certificates'],
                      ['education', 'Education'],
                      ['contact', 'Contact Section'],
                    ] as const
                  ).map(([key, label]) => {
                    const enabled = profile.sectionVisibility[key];
                    return (
                      <div key={key} className="py-3 flex items-center justify-between">
                        <span className="text-sm text-slate-200">{label}</span>
                        <button
                          type="button"
                          disabled={isSyncing}
                          onClick={() => void toggleSection(key)}
                          className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer ${
                            enabled
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-white/[0.04] text-slate-400 border border-white/10'
                          }`}
                        >
                          {enabled ? 'Visible' : 'Hidden'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
