import { useState } from 'react';
import { ArrowUpRight, Github, Layers } from 'lucide-react';
import type { AccentTheme, ProjectItem } from '../data/portfolioData';

interface ProjectCardProps {
  project: ProjectItem;
  accentTheme?: AccentTheme;
  onSelect: (project: ProjectItem) => void;
}

const ACCENT_CLASSES: Record<
  AccentTheme,
  { hoverTitle: string; metric: string; action: string }
> = {
  sapphire: {
    hoverTitle: 'group-hover:text-sky-300',
    metric: 'text-sky-300',
    action: 'text-sky-300 hover:text-sky-200',
  },
  emerald: {
    hoverTitle: 'group-hover:text-emerald-300',
    metric: 'text-emerald-300',
    action: 'text-emerald-300 hover:text-emerald-200',
  },
  amber: {
    hoverTitle: 'group-hover:text-amber-300',
    metric: 'text-amber-300',
    action: 'text-amber-300 hover:text-amber-200',
  },
};

export function ProjectCard({
  project,
  accentTheme = 'sapphire',
  onSelect,
}: ProjectCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const accent = ACCENT_CLASSES[accentTheme] ?? ACCENT_CLASSES.sapphire;

  return (
    <article className="glass-panel-interactive rounded-2xl overflow-hidden flex flex-col">
      <button
        type="button"
        onClick={() => onSelect(project)}
        className="group text-left w-full flex-1 flex flex-col cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0c111b] border-b border-white/[0.08]">
          {!imgFailed && project.image ? (
            <img
              src={project.image}
              alt={project.imageAlt || project.title}
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2.5 bg-gradient-to-br from-[#101827] via-[#0a0f18] to-[#07090d]">
              <Layers className="w-7 h-7 text-sky-400/70" aria-hidden="true" />
              <span className="font-display text-base text-slate-300">{project.title}</span>
            </div>
          )}
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#090d14]/75 via-transparent to-transparent"
            aria-hidden="true"
          />
        </div>

        <div className="p-6 flex-1 flex flex-col justify-between gap-5">
          <div className="space-y-2.5">
            {/* Unboxed metadata with typographic separators */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>{project.category}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{project.year}</span>
              <span aria-hidden="true">·</span>
              <span>{project.role}</span>
              {project.featured && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-300">Featured</span>
                </>
              )}
            </div>

            <h3
              className={`text-xl font-semibold tracking-tight text-slate-50 transition-colors ${accent.hoverTitle}`}
            >
              {project.title}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">{project.summary}</p>
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-4">
            <span className="text-xs text-slate-400 truncate">
              {project.stack.join(' · ')}
            </span>
            {project.outcomes[0]?.metric && (
              <span
                className={`font-mono text-xs tabular-nums whitespace-nowrap shrink-0 ${accent.metric}`}
              >
                {project.outcomes[0].metric}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Direct action bar */}
      <div className="px-6 py-3.5 border-t border-white/[0.07] bg-white/[0.015] flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onSelect(project)}
          className={`text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm ${accent.action}`}
        >
          Inspect Case Study
        </button>

        <div className="flex items-center gap-4">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} GitHub repository`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm"
            >
              <Github className="w-3.5 h-3.5" aria-hidden="true" />
              <span>GitHub</span>
            </a>
          )}

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} live demo`}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-200 hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm"
            >
              <span>Live</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
