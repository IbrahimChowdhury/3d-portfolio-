import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import type { PortfolioProfile } from '../../data/portfolioData';

export function ProfileEditor() {
  const { profile, saveProfile, isSyncing } = usePortfolio();
  const [draft, setDraft] = useState<PortfolioProfile>(profile);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const handleMetricChange = (index: number, field: 'value' | 'label', value: string) => {
    setDraft((prev) => {
      const next = [...prev.metrics];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, metrics: next };
    });
  };

  const handleAddMetric = () => {
    if (draft.metrics.length >= 4) return;
    setDraft((prev) => ({
      ...prev,
      metrics: [...prev.metrics, { value: '100%', label: 'New engineering milestone' }],
    }));
  };

  const handleRemoveMetric = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      metrics: prev.metrics.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await saveProfile(draft);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Identity & Hero */}
      <section className="rounded-xl border border-white/10 bg-[#0d121c] p-6 space-y-5">
        <div className="border-b border-white/[0.08] pb-4">
          <h2 className="text-base font-semibold text-white">Identity & Hero Section</h2>
          <p className="text-xs text-slate-400 mt-1">
            Controls your display name, role, headline, and opening bio on the live homepage.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-slate-300">Full Name</span>
            <input
              type="text"
              required
              maxLength={100}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-slate-300">Role Title</span>
            <input
              type="text"
              required
              maxLength={120}
              value={draft.role}
              onChange={(e) => setDraft({ ...draft, role: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
            />
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-slate-300">Hero Headline</span>
          <input
            type="text"
            required
            maxLength={180}
            value={draft.headline}
            onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-slate-300">Location</span>
            <input
              type="text"
              required
              maxLength={120}
              value={draft.location}
              onChange={(e) => setDraft({ ...draft, location: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-slate-300">Availability Line</span>
            <input
              type="text"
              required
              maxLength={160}
              value={draft.availability}
              onChange={(e) => setDraft({ ...draft, availability: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
            />
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-slate-300">Hero Summary</span>
          <textarea
            rows={3}
            required
            maxLength={600}
            value={draft.heroSummary}
            onChange={(e) => setDraft({ ...draft, heroSummary: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400 resize-y"
          />
        </label>
      </section>

      {/* About Story */}
      <section className="rounded-xl border border-white/10 bg-[#0d121c] p-6 space-y-4">
        <div className="border-b border-white/[0.08] pb-4">
          <h2 className="text-base font-semibold text-white">About Narrative</h2>
          <p className="text-xs text-slate-400 mt-1">
            Displayed in the About panel alongside your interactive skills breakdown.
          </p>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-slate-300">About Lead Paragraph</span>
          <textarea
            rows={2}
            required
            maxLength={600}
            value={draft.aboutLead}
            onChange={(e) => setDraft({ ...draft, aboutLead: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400 resize-y"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-slate-300">About Extended Paragraph</span>
          <textarea
            rows={3}
            required
            maxLength={1200}
            value={draft.aboutBody}
            onChange={(e) => setDraft({ ...draft, aboutBody: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400 resize-y"
          />
        </label>
      </section>

      {/* Contact & Links */}
      <section className="rounded-xl border border-white/10 bg-[#0d121c] p-6 space-y-4">
        <div className="border-b border-white/[0.08] pb-4">
          <h2 className="text-base font-semibold text-white">Contact Channels & CV Link</h2>
          <p className="text-xs text-slate-400 mt-1">
            Direct email, optional public phone number, social profiles, and downloadable CV PDF path.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-slate-300">Public Contact Email</span>
            <input
              type="email"
              required
              maxLength={120}
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
            />
          </label>

          <div className="space-y-1.5">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-300">Phone Number</span>
              <input
                type="text"
                maxLength={40}
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
              />
            </label>
            <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={draft.showPhone}
                onChange={(e) => setDraft({ ...draft, showPhone: e.target.checked })}
                className="rounded border-white/20 bg-[#07090d] text-sky-400 focus:ring-sky-400"
              />
              <span>Display phone number on public Contact & Resume views</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-slate-300">GitHub URL</span>
            <input
              type="url"
              maxLength={240}
              value={draft.githubUrl}
              onChange={(e) => setDraft({ ...draft, githubUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-slate-300">LinkedIn URL</span>
            <input
              type="url"
              maxLength={240}
              value={draft.linkedinUrl}
              onChange={(e) => setDraft({ ...draft, linkedinUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-slate-300">Portfolio Website URL</span>
            <input
              type="url"
              maxLength={240}
              value={draft.portfolioUrl}
              onChange={(e) => setDraft({ ...draft, portfolioUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-slate-300">CV PDF File Path / URL</span>
            <input
              type="text"
              maxLength={240}
              value={draft.resumeUrl}
              onChange={(e) => setDraft({ ...draft, resumeUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
            />
          </label>
        </div>
      </section>

      {/* Highlight Metrics */}
      <section className="rounded-xl border border-white/10 bg-[#0d121c] p-6 space-y-4">
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Hero Proof Metrics</h2>
            <p className="text-xs text-slate-400 mt-1">
              Up to 4 measurable highlights displayed in the full-width strip beneath your Hero.
            </p>
          </div>
          {draft.metrics.length < 4 && (
            <button
              type="button"
              onClick={handleAddMetric}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 border border-white/15 hover:bg-white/[0.05] cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add Metric</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {draft.metrics.map((m, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <input
                type="text"
                maxLength={40}
                value={m.value}
                onChange={(e) => handleMetricChange(idx, 'value', e.target.value)}
                placeholder="e.g. 20%"
                className="sm:col-span-3 px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm font-mono text-white focus:outline-none focus:border-sky-400"
              />
              <input
                type="text"
                maxLength={160}
                value={m.label}
                onChange={(e) => handleMetricChange(idx, 'label', e.target.value)}
                placeholder="Context and unit"
                className="sm:col-span-8 px-3 py-2 rounded-lg bg-[#07090d] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400"
              />
              <button
                type="button"
                onClick={() => handleRemoveMetric(idx)}
                aria-label="Remove metric"
                className="sm:col-span-1 inline-flex items-center justify-center h-9 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSyncing}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Save className="w-4 h-4" aria-hidden="true" />
          <span>{isSyncing ? 'Saving...' : 'Save Profile Changes'}</span>
        </button>
      </div>
    </form>
  );
}
