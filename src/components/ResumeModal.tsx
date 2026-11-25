import { useEffect } from 'react';
import { Download, Printer, X } from 'lucide-react';
import { buildPlainTextResume, RESUME_CONTENT } from '../data/portfolioData';

interface ResumeModalProps {
  open: boolean;
  onClose: () => void;
}

export function ResumeModal({ open, onClose }: ResumeModalProps) {
  useEffect(() => {
    if (!open) return;
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
  }, [open, onClose]);

  if (!open) return null;

  const handleDownload = () => {
    const content = buildPlainTextResume();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Darian_Mercer_Resume.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-modal-title"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h3
              id="resume-modal-title"
              className="text-xl sm:text-2xl font-semibold tracking-tight text-white"
            >
              {RESUME_CONTENT.headline}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              {RESUME_CONTENT.contactLine}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close resume preview"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/15 text-slate-200 hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-slate-400">Summary</h4>
            <p>{RESUME_CONTENT.summary}</p>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-slate-400">Core Stack</h4>
            <p className="text-slate-100">
              React · Next.js · Node.js · MongoDB · TypeScript · Applied AI
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-400">Experience</h4>
            {RESUME_CONTENT.experience.map((job) => (
              <div
                key={`${job.company}-${job.period}`}
                className="space-y-2 pb-4 border-b border-white/[0.07] last:border-b-0 last:pb-0"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="font-semibold text-slate-100">
                    {job.role} <span className="text-slate-400 font-normal">· {job.company}</span>
                  </div>
                  <div className="font-mono text-xs text-slate-400 tabular-nums">
                    {job.period}
                  </div>
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  {job.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="text-sky-400 select-none" aria-hidden="true">
                        —
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-slate-400">Education</h4>
            <p className="text-slate-200">{RESUME_CONTENT.education}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Download Resume</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-slate-200 border border-white/15 hover:border-white/30 hover:bg-white/[0.05] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
