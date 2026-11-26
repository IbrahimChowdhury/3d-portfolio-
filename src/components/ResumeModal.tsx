import { useEffect } from 'react';
import { Download, FileText, Printer, X } from 'lucide-react';
import {
  buildPlainTextResume,
  type CertificateItem,
  type EducationItem,
  type PortfolioProfile,
  type ProjectItem,
  type SkillCategory,
} from '../data/portfolioData';

interface ResumeModalProps {
  open: boolean;
  onClose: () => void;
  profile: PortfolioProfile;
  skills: SkillCategory[];
  projects: ProjectItem[];
  certificates: CertificateItem[];
  education: EducationItem[];
}

export function ResumeModal({
  open,
  onClose,
  profile,
  skills,
  projects,
  certificates,
  education,
}: ResumeModalProps) {
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

  const publishedSkills = skills.filter((s) => s.published);
  const publishedProjects = projects.filter((p) => p.published);
  const publishedCerts = certificates.filter((c) => c.published);
  const publishedEdu = education.filter((e) => e.published);

  const handleDownloadText = () => {
    const content = buildPlainTextResume(
      profile,
      publishedSkills,
      publishedProjects,
      publishedCerts,
      publishedEdu,
    );
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.name.replace(/\s+/g, '_')}_CV.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        className="glass-panel w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h3
              id="resume-modal-title"
              className="text-xl sm:text-2xl font-semibold tracking-tight text-white"
            >
              {profile.name} — {profile.role}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              {profile.email}
              {profile.showPhone && profile.phone ? ` · ${profile.phone}` : ''}
              {profile.location ? ` · ${profile.location}` : ''}
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
          {/* Summary */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-slate-400">Summary</h4>
            <p>{profile.heroSummary}</p>
          </div>

          {/* Skills */}
          {publishedSkills.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-400">Technical Skills</h4>
              <div className="space-y-1.5 text-xs sm:text-sm">
                {publishedSkills.map((group) => (
                  <div key={group.id}>
                    <span className="font-semibold text-slate-100">{group.name}: </span>
                    <span className="text-slate-300">{group.items.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {publishedProjects.length > 0 && (
            <div className="space-y-3.5">
              <h4 className="text-xs font-semibold text-slate-400">Projects</h4>
              {publishedProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="space-y-1 pb-3.5 border-b border-white/[0.07] last:border-b-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="font-semibold text-slate-100">{proj.title}</div>
                    <div className="font-mono text-xs text-slate-400 tabular-nums">
                      {proj.year}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">{proj.stack.join(' · ')}</div>
                  <p className="text-xs sm:text-sm text-slate-300">{proj.summary}</p>
                </div>
              ))}
            </div>
          )}

          {/* Certificates */}
          {publishedCerts.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-400">Certificates</h4>
              {publishedCerts.map((cert) => (
                <div key={cert.id} className="space-y-0.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="font-medium text-slate-100">
                      {cert.title} — <span className="text-slate-300">{cert.program}</span>
                    </div>
                    <span className="font-mono text-xs text-slate-400 tabular-nums">
                      Issued {cert.issuedYear}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{cert.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {publishedEdu.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400">Education</h4>
              {publishedEdu.map((edu) => (
                <div key={edu.id} className="space-y-0.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="font-semibold text-slate-100">{edu.degree}</div>
                    <span className="font-mono text-xs text-slate-400 tabular-nums">
                      {edu.period}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300">
                    {edu.institution} · {edu.department}
                  </div>
                  <div className="font-mono text-xs text-slate-400 tabular-nums">
                    CGPA: {edu.cgpa} · Status: {edu.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/10">
          {profile.resumeUrl && (
            <a
              href={profile.resumeUrl}
              download="Ibrahim_Chowdhury_CV.pdf"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Download Original PDF CV</span>
            </a>
          )}

          <button
            type="button"
            onClick={handleDownloadText}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-200 border border-white/15 hover:border-white/30 hover:bg-white/[0.05] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            <span>Export Live Text</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-200 border border-white/15 hover:border-white/30 hover:bg-white/[0.05] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            <span>Print</span>
          </button>
        </div>
      </div>
    </div>
  );
}
