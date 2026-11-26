import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Pencil, Plus, Trash2, X } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import type {
  CertificateItem,
  EducationItem,
  SkillCategory,
} from '../../data/portfolioData';

export function SkillsManager() {
  const { skills, saveSkill, deleteSkill, isSyncing } = usePortfolio();
  const [editing, setEditing] = useState<{ item: SkillCategory; isNew: boolean } | null>(null);
  const [itemsText, setItemsText] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const openEditor = (item: SkillCategory, isNew: boolean) => {
    setEditing({ item: { ...item }, isNew });
    setItemsText(item.items.join(', '));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const parsedItems = itemsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    await saveSkill({ ...editing.item, items: parsedItems }, editing.isNew);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-400">
          Manage all technical skill groups shown in your interactive Tech Stack explorer.
        </p>
        <button
          type="button"
          onClick={() =>
            openEditor(
              {
                id: '',
                name: '',
                domain: 'Core Engineering',
                experience: 'Production',
                summary: '',
                items: [],
                order: skills.length + 1,
                published: true,
              },
              true,
            )
          }
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add Skill Group</span>
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0d121c] divide-y divide-white/[0.06]">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.015] transition-colors"
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-white">{skill.name}</span>
                <span className="text-xs text-slate-400">· {skill.domain}</span>
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  · #{skill.order}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {skill.items.join(' · ')}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={isSyncing}
                onClick={() => void saveSkill({ ...skill, published: !skill.published }, false)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  skill.published ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {skill.published ? (
                  <>
                    <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Live</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Hidden</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => openEditor(skill, false)}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.06] cursor-pointer"
                aria-label={`Edit ${skill.name}`}
              >
                <Pencil className="w-4 h-4" aria-hidden="true" />
              </button>
              {confirmId === skill.id ? (
                <button
                  type="button"
                  onClick={async () => {
                    await deleteSkill(skill.id);
                    setConfirmId(null);
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500 text-white cursor-pointer"
                >
                  Confirm
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmId(skill.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  aria-label={`Delete ${skill.name}`}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          role="dialog"
          aria-modal="true"
          onClick={() => setEditing(null)}
        >
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-2xl border border-white/12 bg-[#0d121c] p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-semibold text-white">
                {editing.isNew ? 'Add Skill Category' : `Edit ${editing.item.name}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs text-slate-300">Category Name</span>
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={editing.item.name}
                  onChange={(e) =>
                    setEditing({ ...editing, item: { ...editing.item, name: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs text-slate-300">Focus Subtitle</span>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={editing.item.domain}
                  onChange={(e) =>
                    setEditing({ ...editing, item: { ...editing.item, domain: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs text-slate-300">Experience Label</span>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={editing.item.experience}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      item: { ...editing.item, experience: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs text-slate-300">Order</span>
                <input
                  type="number"
                  min={0}
                  max={999}
                  value={editing.item.order}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      item: { ...editing.item, order: Number(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm font-mono text-white focus:outline-none focus:border-sky-400"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-xs text-slate-300">Short Summary</span>
              <textarea
                rows={2}
                required
                minLength={5}
                maxLength={500}
                value={editing.item.summary}
                onChange={(e) =>
                  setEditing({ ...editing, item: { ...editing.item, summary: e.target.value } })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs text-slate-300">Skills (comma-separated, max 24)</span>
              <textarea
                rows={3}
                required
                value={itemsText}
                onChange={(e) => setItemsText(e.target.value)}
                placeholder="React.js, Next.js, Tailwind CSS, ShadCN UI"
                className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
              />
            </label>

            <label className="inline-flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.item.published}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    item: { ...editing.item, published: e.target.checked },
                  })
                }
              />
              <span>Visible on Homepage</span>
            </label>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-lg text-xs text-slate-300 border border-white/15 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSyncing}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 cursor-pointer"
              >
                Save Skill Group
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function CertificatesManager() {
  const { certificates, saveCertificate, deleteCertificate, isSyncing } = usePortfolio();
  const [editing, setEditing] = useState<{ item: CertificateItem; isNew: boolean } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    await saveCertificate(editing.item, editing.isNew);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-400">
          Manage your verified course completions and technical assessment certificates.
        </p>
        <button
          type="button"
          onClick={() =>
            setEditing({
              isNew: true,
              item: {
                id: '',
                title: '',
                program: '',
                issuer: '',
                issuedYear: '2025',
                description: '',
                credentialUrl: '/assets/aistudio/New_Ibrahim_cv_71d777f1.pdf',
                order: certificates.length + 1,
                published: true,
              },
            })
          }
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add Certificate</span>
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0d121c] divide-y divide-white/[0.06]">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="text-xs text-slate-400">
                {cert.issuer} · <span className="font-mono tabular-nums">{cert.issuedYear}</span>
              </div>
              <div className="font-semibold text-white">
                {cert.title} <span className="font-normal text-slate-400">— {cert.program}</span>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl">{cert.description}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  void saveCertificate({ ...cert, published: !cert.published }, false)
                }
                className={`text-xs font-medium px-2.5 py-1.5 cursor-pointer ${
                  cert.published ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {cert.published ? 'Live' : 'Hidden'}
              </button>
              <button
                type="button"
                onClick={() => setEditing({ item: { ...cert }, isNew: false })}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.06] cursor-pointer"
                aria-label={`Edit ${cert.title}`}
              >
                <Pencil className="w-4 h-4" aria-hidden="true" />
              </button>
              {confirmId === cert.id ? (
                <button
                  type="button"
                  onClick={async () => {
                    await deleteCertificate(cert.id);
                    setConfirmId(null);
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500 text-white cursor-pointer"
                >
                  Confirm
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmId(cert.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  aria-label={`Delete ${cert.title}`}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          role="dialog"
          aria-modal="true"
          onClick={() => setEditing(null)}
        >
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-2xl border border-white/12 bg-[#0d121c] p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-semibold text-white">
                {editing.isNew ? 'Add Certificate' : 'Edit Certificate'}
              </h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs text-slate-300">Certificate Title</span>
                <input
                  type="text"
                  required
                  maxLength={140}
                  value={editing.item.title}
                  onChange={(e) =>
                    setEditing({ ...editing, item: { ...editing.item, title: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs text-slate-300">Program Name</span>
                <input
                  type="text"
                  required
                  maxLength={140}
                  value={editing.item.program}
                  onChange={(e) =>
                    setEditing({ ...editing, item: { ...editing.item, program: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="sm:col-span-2 block space-y-1">
                <span className="text-xs text-slate-300">Issuer</span>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={editing.item.issuer}
                  onChange={(e) =>
                    setEditing({ ...editing, item: { ...editing.item, issuer: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs text-slate-300">Issued Year</span>
                <input
                  type="text"
                  required
                  maxLength={30}
                  value={editing.item.issuedYear}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      item: { ...editing.item, issuedYear: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm font-mono text-white focus:outline-none focus:border-sky-400"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-xs text-slate-300">Description</span>
              <textarea
                rows={3}
                required
                minLength={5}
                maxLength={600}
                value={editing.item.description}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    item: { ...editing.item, description: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs text-slate-300">Credential Verification URL</span>
              <input
                type="text"
                maxLength={300}
                value={editing.item.credentialUrl}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    item: { ...editing.item, credentialUrl: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
              />
            </label>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-lg text-xs text-slate-300 border border-white/15 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSyncing}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 cursor-pointer"
              >
                Save Certificate
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function EducationManager() {
  const { education, saveEducation, deleteEducation, isSyncing } = usePortfolio();
  const [editing, setEditing] = useState<{ item: EducationItem; isNew: boolean } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    await saveEducation(editing.item, editing.isNew);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-400">
          Manage your university degrees, department info, CGPA, and academic status.
        </p>
        <button
          type="button"
          onClick={() =>
            setEditing({
              isNew: true,
              item: {
                id: '',
                degree: '',
                institution: '',
                department: '',
                period: '2020 – Present',
                cgpa: '',
                status: '',
                order: education.length + 1,
                published: true,
              },
            })
          }
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add Education</span>
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0d121c] divide-y divide-white/[0.06]">
        {education.map((edu) => (
          <div
            key={edu.id}
            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="font-semibold text-white">{edu.degree}</div>
              <div className="text-xs text-slate-300">
                {edu.institution} · {edu.department}
              </div>
              <div className="text-xs font-mono text-slate-400 tabular-nums">
                {edu.period} · CGPA: {edu.cgpa} · {edu.status}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setEditing({ item: { ...edu }, isNew: false })}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.06] cursor-pointer"
                aria-label={`Edit ${edu.degree}`}
              >
                <Pencil className="w-4 h-4" aria-hidden="true" />
              </button>
              {confirmId === edu.id ? (
                <button
                  type="button"
                  onClick={async () => {
                    await deleteEducation(edu.id);
                    setConfirmId(null);
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500 text-white cursor-pointer"
                >
                  Confirm
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmId(edu.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  aria-label={`Delete ${edu.degree}`}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          role="dialog"
          aria-modal="true"
          onClick={() => setEditing(null)}
        >
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-2xl border border-white/12 bg-[#0d121c] p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-semibold text-white">
                {editing.isNew ? 'Add Education Record' : 'Edit Education Record'}
              </h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <label className="block space-y-1">
              <span className="text-xs text-slate-300">Degree Title</span>
              <input
                type="text"
                required
                maxLength={160}
                value={editing.item.degree}
                onChange={(e) =>
                  setEditing({ ...editing, item: { ...editing.item, degree: e.target.value } })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs text-slate-300">Institution</span>
                <input
                  type="text"
                  required
                  maxLength={140}
                  value={editing.item.institution}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      item: { ...editing.item, institution: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs text-slate-300">Department</span>
                <input
                  type="text"
                  required
                  maxLength={140}
                  value={editing.item.department}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      item: { ...editing.item, department: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="block space-y-1">
                <span className="text-xs text-slate-300">Period</span>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={editing.item.period}
                  onChange={(e) =>
                    setEditing({ ...editing, item: { ...editing.item, period: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs text-slate-300">CGPA</span>
                <input
                  type="text"
                  maxLength={40}
                  value={editing.item.cgpa}
                  onChange={(e) =>
                    setEditing({ ...editing, item: { ...editing.item, cgpa: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm font-mono text-white focus:outline-none focus:border-sky-400"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs text-slate-300">Status</span>
                <input
                  type="text"
                  maxLength={60}
                  value={editing.item.status}
                  onChange={(e) =>
                    setEditing({ ...editing, item: { ...editing.item, status: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-lg text-xs text-slate-300 border border-white/15 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSyncing}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 cursor-pointer"
              >
                Save Education
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
