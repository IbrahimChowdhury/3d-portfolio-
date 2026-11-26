import { useEffect, useState } from 'react';
import { ArrowUpRight, Github, Layers, X } from 'lucide-react';
import type { ProjectItem } from '../data/portfolioData';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top media frame with scrim & high-contrast close button */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#0c111b] border-b border-white/10">
          {!imgFailed ? (
            <img
              src={project.image}
              alt={project.imageAlt}
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#101827] via-[#0a0f18] to-[#07090d]">
              <Layers className="w-8 h-8 text-sky-400/70" aria-hidden="true" />
              <span className="font-display text-lg text-slate-300">{project.title}</span>
            </div>
          )}

          <div
            className="absolute inset-0 bg-gradient-to-t from-[#090d14] via-[#090d14]/35 to-transparent"
            aria-hidden="true"
          />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close project details"
            className="absolute top-4 right-4 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#090d14]/90 border border-white/15 text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          <div className="absolute bottom-5 left-6 right-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mb-1.5">
              <span>{project.category}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{project.year}</span>
              <span aria-hidden="true">·</span>
              <span>{project.role}</span>
            </div>
            <h3
              id="project-modal-title"
              className="text-2xl sm:text-3xl font-semibold tracking-tight text-white"
            >
              {project.title}
            </h3>
          </div>
        </div>

        {/* Modal body */}
        <div className="p-6 sm:p-8 space-y-7">
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {project.description}
          </p>

          {/* Measurable Outcomes */}
          {project.outcomes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-5 border-y border-white/10">
              {project.outcomes.map((item, idx) => (
                <div key={`${item.label}-${idx}`} className="space-y-1">
                  <div className="font-mono text-xl sm:text-2xl font-medium text-sky-300 tabular-nums">
                    {item.metric}
                  </div>
                  <div className="text-xs text-slate-400 leading-snug">{item.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Architectural Notes */}
          {project.architecture.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-100">System Architecture</h4>
              <ul className="space-y-2.5 text-sm text-slate-300 leading-relaxed">
                {project.architecture.map((point, idx) => (
                  <li key={`${point}-${idx}`} className="flex items-start gap-3">
                    <span className="text-sky-400 select-none" aria-hidden="true">
                      —
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Unboxed Technology Stack Metadata */}
          {project.stack.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs text-slate-400">Core Technologies</div>
              <div className="text-sm text-slate-200 font-medium">
                {project.stack.join(' · ')}
              </div>
            </div>
          )}

          {/* Action Bar */}
          {(project.liveUrl || project.githubUrl) && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                >
                  <span>Visit Live Demo</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </a>
              )}

              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-slate-100 border border-white/15 hover:border-white/30 hover:bg-white/[0.05] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <Github className="w-4 h-4" aria-hidden="true" />
                  <span>View Source on GitHub</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
