import { useMemo, useState, type FormEvent } from 'react';
import { Eye, EyeOff, Pencil, Plus, Search, Star, Trash2, X } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  PROJECT_IMAGE_PRESETS,
  type EditableProjectCategory,
  type ProjectItem,
} from '../../data/portfolioData';

const EMPTY_PROJECT: ProjectItem = {
  id: '',
  title: '',
  category: 'Full-Stack',
  year: '2026',
  role: 'Full-Stack Developer',
  summary: '',
  description: '',
  image: PROJECT_IMAGE_PRESETS[0].url,
  imageAlt: 'Project preview artwork',
  stack: ['React', 'Next.js', 'Tailwind CSS'],
  architecture: [''],
  outcomes: [{ metric: 'Live', label: 'Production deployment' }],
  liveUrl: '',
  githubUrl: '',
  featured: false,
  order: 5,
  published: true,
};

export function ProjectsManager() {
  const { projects, saveProject, deleteProject, isSyncing } = usePortfolio();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<'All' | EditableProjectCategory>('All');
  const [editing, setEditing] = useState<{ item: ProjectItem; isNew: boolean } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Raw text fields inside modal editor
  const [stackText, setStackText] = useState('');
  const [archText, setArchText] = useState('');
  const [outcomesText, setOutcomesText] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (catFilter !== 'All' && p.category !== catFilter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.stack.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [projects, search, catFilter]);

  const openEditor = (item: ProjectItem, isNew: boolean) => {
    setEditing({ item: { ...item }, isNew });
    setStackText(item.stack.join(', '));
    setArchText(item.architecture.join('\n'));
    setOutcomesText(item.outcomes.map((o) => `${o.metric} | ${o.label}`).join('\n'));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const parsedStack = stackText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedArch = archText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedOutcomes = outcomesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [metric, ...rest] = line.split('|');
        return {
          metric: (metric ?? '').trim() || 'Result',
          label: rest.join('|').trim() || 'Measured outcome',
        };
      });

    await saveProject(
      {
        ...editing.item,
        stack: parsedStack,
        architecture: parsedArch,
        outcomes: parsedOutcomes,
      },
      editing.isNew,
    );
    setEditing(null);
  };

  const togglePublished = async (proj: ProjectItem) => {
    await saveProject({ ...proj, published: !proj.published }, false);
  };

  const toggleFeatured = async (proj: ProjectItem) => {
    await saveProject({ ...proj, featured: !proj.featured }, false);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects or tech..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#0d121c] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
            />
          </div>

          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#0d121c] border border-white/10">
            {(['All', 'Full-Stack', 'AI Systems', 'Platform'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCatFilter(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  catFilter === cat
                    ? 'bg-sky-400 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            openEditor(
              { ...EMPTY_PROJECT, order: projects.length + 1 },
              true,
            )
          }
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add Project</span>
        </button>
      </div>

      {/* High-density Projects Table */}
      <div className="rounded-xl border border-white/10 bg-[#0d121c] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm text-slate-300">No projects match your current filter.</p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCatFilter('All');
              }}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-sky-300 border border-sky-400/30 hover:bg-sky-400/10 cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs text-slate-400">
                  <th className="py-3.5 px-4 font-medium">Project</th>
                  <th className="py-3.5 px-4 font-medium">Category</th>
                  <th className="py-3.5 px-4 font-medium">Stack</th>
                  <th className="py-3.5 px-4 font-medium text-right">Order</th>
                  <th className="py-3.5 px-4 font-medium">Visibility</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-sm">
                {filtered.map((proj) => (
                  <tr key={proj.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white flex items-center gap-2">
                        <span>{proj.title}</span>
                        {proj.featured && (
                          <span className="text-xs font-normal text-amber-300">· Featured</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1 max-w-md mt-0.5">
                        {proj.summary}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300 whitespace-nowrap">
                      {proj.category} · <span className="font-mono tabular-nums">{proj.year}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400 max-w-xs truncate">
                      {proj.stack.join(' · ')}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono tabular-nums text-slate-300 text-right">
                      {proj.order}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        disabled={isSyncing}
                        onClick={() => void togglePublished(proj)}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
                          proj.published ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {proj.published ? (
                          <>
                            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          disabled={isSyncing}
                          onClick={() => void toggleFeatured(proj)}
                          title={proj.featured ? 'Remove featured' : 'Mark featured'}
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${
                            proj.featured
                              ? 'text-amber-300 hover:bg-amber-400/10'
                              : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                          }`}
                        >
                          <Star
                            className={`w-4 h-4 ${proj.featured ? 'fill-current' : ''}`}
                            aria-hidden="true"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditor(proj, false)}
                          title="Edit project"
                          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" aria-hidden="true" />
                        </button>
                        {confirmDeleteId === proj.id ? (
                          <button
                            type="button"
                            disabled={isSyncing}
                            onClick={async () => {
                              await deleteProject(proj.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500 text-white hover:bg-rose-400 cursor-pointer"
                          >
                            Confirm
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(proj.id)}
                            title="Delete project"
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Project Modal */}
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
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/12 bg-[#0d121c] p-6 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-semibold text-white">
                {editing.isNew ? 'Create New Project' : `Edit ${editing.item.title}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Close editor"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-slate-300">Project Title</span>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={editing.item.title}
                  onChange={(e) =>
                    setEditing({ ...editing, item: { ...editing.item, title: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-slate-300">Category</span>
                <select
                  value={editing.item.category}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      item: {
                        ...editing.item,
                        category: e.target.value as EditableProjectCategory,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
                >
                  <option value="Full-Stack">Full-Stack</option>
                  <option value="AI Systems">AI Systems</option>
                  <option value="Platform">Platform</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-slate-300">Role</span>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={editing.item.role}
                  onChange={(e) =>
                    setEditing({ ...editing, item: { ...editing.item, role: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-slate-300">Year</span>
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={editing.item.year}
                  onChange={(e) =>
                    setEditing({ ...editing, item: { ...editing.item, year: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm font-mono text-white focus:outline-none focus:border-sky-400"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-slate-300">Display Order</span>
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

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-300">Card Summary</span>
              <textarea
                rows={2}
                required
                minLength={10}
                maxLength={400}
                value={editing.item.summary}
                onChange={(e) =>
                  setEditing({ ...editing, item: { ...editing.item, summary: e.target.value } })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-300">Full Case Study Description</span>
              <textarea
                rows={3}
                required
                minLength={10}
                maxLength={1500}
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

            <div className="space-y-2">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-slate-300">Cover Artwork URL</span>
                <input
                  type="text"
                  maxLength={400}
                  value={editing.item.image}
                  onChange={(e) =>
                    setEditing({ ...editing, item: { ...editing.item, image: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </label>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>Built-in visuals:</span>
                {PROJECT_IMAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        item: { ...editing.item, image: preset.url },
                      })
                    }
                    className={`px-2.5 py-1 rounded border cursor-pointer transition-colors ${
                      editing.item.image === preset.url
                        ? 'border-sky-400 text-sky-300 bg-sky-400/10'
                        : 'border-white/10 text-slate-300 hover:border-white/25'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-300">
                Technologies (comma-separated, max 16)
              </span>
              <input
                type="text"
                value={stackText}
                onChange={(e) => setStackText(e.target.value)}
                placeholder="React, Next.js, Node.js, Supabase, Tailwind CSS"
                className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-slate-300">
                  Architecture Highlights (1 per line)
                </span>
                <textarea
                  rows={3}
                  value={archText}
                  onChange={(e) => setArchText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-slate-300">
                  Outcomes (format: Metric | Label, 1 per line)
                </span>
                <textarea
                  rows={3}
                  value={outcomesText}
                  onChange={(e) => setOutcomesText(e.target.value)}
                  placeholder="20% | Automated workflows"
                  className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-xs font-mono text-white focus:outline-none focus:border-sky-400"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-slate-300">Live Demo URL</span>
                <input
                  type="url"
                  maxLength={300}
                  value={editing.item.liveUrl}
                  onChange={(e) =>
                    setEditing({ ...editing, item: { ...editing.item, liveUrl: e.target.value } })
                  }
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-slate-300">GitHub Repo URL</span>
                <input
                  type="url"
                  maxLength={300}
                  value={editing.item.githubUrl}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      item: { ...editing.item, githubUrl: e.target.value },
                    })
                  }
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-1">
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
                <span>Published on Homepage</span>
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.item.featured}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      item: { ...editing.item, featured: e.target.checked },
                    })
                  }
                />
                <span>Highlight as Featured</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 border border-white/15 hover:bg-white/[0.05] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSyncing}
                className="px-5 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 disabled:opacity-50 cursor-pointer"
              >
                {isSyncing ? 'Saving...' : 'Save Project'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
