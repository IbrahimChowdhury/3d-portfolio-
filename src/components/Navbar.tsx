import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { AccentTheme, PortfolioProfile } from '../data/portfolioData';

interface NavbarProps {
  profile: PortfolioProfile;
  activeSection: string;
  onOpenResume: () => void;
  onOpenAdmin: () => void;
}

const ACCENT_STYLES: Record<
  AccentTheme,
  { underline: string; cta: string; mobileActive: string }
> = {
  sapphire: {
    underline: 'after:bg-sky-400',
    cta: 'bg-sky-400 hover:bg-sky-300 text-slate-950 focus-visible:ring-sky-300',
    mobileActive: 'text-sky-300 bg-white/[0.04]',
  },
  emerald: {
    underline: 'after:bg-emerald-400',
    cta: 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 focus-visible:ring-emerald-300',
    mobileActive: 'text-emerald-300 bg-white/[0.04]',
  },
  amber: {
    underline: 'after:bg-amber-400',
    cta: 'bg-amber-400 hover:bg-amber-300 text-slate-950 focus-visible:ring-amber-300',
    mobileActive: 'text-amber-300 bg-white/[0.04]',
  },
};

export function Navbar({
  profile,
  activeSection,
  onOpenResume,
  onOpenAdmin,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const accent = ACCENT_STYLES[profile.sceneSettings.accentTheme] ?? ACCENT_STYLES.sapphire;

  const anchorLinks = [
    { href: '#about', id: 'about', label: 'About', visible: profile.sectionVisibility.about },
    { href: '#skills', id: 'skills', label: 'Skills', visible: profile.sectionVisibility.skills },
    {
      href: '#projects',
      id: 'projects',
      label: 'Projects',
      visible: profile.sectionVisibility.projects,
    },
    {
      href: '#contact',
      id: 'contact',
      label: 'Contact',
      visible: profile.sectionVisibility.contact,
    },
  ].filter((l) => l.visible);

  return (
    <header className="fixed top-0 inset-x-0 z-30 glass-bar">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <a
          href="#hero"
          className="font-display text-base sm:text-lg font-semibold tracking-tight text-slate-100 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm"
        >
          {profile.name}
        </a>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {anchorLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm ${
                  isActive
                    ? `text-slate-50 after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-px ${accent.underline}`
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {link.label}
              </a>
            );
          })}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="py-1 text-slate-400 hover:text-slate-100 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm"
          >
            Admin
          </button>
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenResume}
            className={`hidden md:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07090d] ${accent.cta}`}
          >
            Resume
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-slate-200 hover:bg-white/5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#090d14]/98 px-4 py-4">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {anchorLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === link.id
                    ? accent.mobileActive
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenAdmin();
              }}
              className="text-left px-3 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.03] transition-colors cursor-pointer"
            >
              Admin Dashboard
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenResume();
              }}
              className={`mt-2 w-full py-3 px-4 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${accent.cta}`}
            >
              Resume
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
