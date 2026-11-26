import { useMemo, useState } from 'react';
import { Archive, Check, Inbox, Mail, Search, Trash2 } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import type { MessageStatus } from '../../data/portfolioData';

export function MessagesInbox() {
  const { messages, updateMessageStatus, deleteMessage, isSyncing } = usePortfolio();
  const [statusFilter, setStatusFilter] = useState<'all' | MessageStatus>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return messages.filter((m) => {
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    });
  }, [messages, statusFilter, search]);

  const activeMessage = useMemo(
    () => filtered.find((m) => m.id === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId],
  );

  const formatDate = (ms: number) =>
    new Date(ms).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="space-y-5">
      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sender, email, or subject..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#0d121c] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
          />
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#0d121c] border border-white/10 self-start sm:self-auto">
          {(['all', 'unread', 'read', 'archived'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                statusFilter === status
                  ? 'bg-sky-400 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Inbox Split Pane */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#0d121c] p-12 text-center space-y-2.5">
          <Inbox className="w-7 h-7 text-slate-500 mx-auto" aria-hidden="true" />
          <div className="text-sm font-medium text-slate-200">No messages in this view</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Inquiries submitted through your public homepage Contact form appear here in real time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-xl border border-white/10 bg-[#0d121c] overflow-hidden min-h-[420px]">
          {/* Left Message List */}
          <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-white/10 divide-y divide-white/[0.06] max-h-[520px] overflow-y-auto">
            {filtered.map((msg) => {
              const selected = activeMessage?.id === msg.id;
              return (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(msg.id);
                    if (msg.status === 'unread') {
                      void updateMessageStatus(msg.id, 'read');
                    }
                  }}
                  className={`w-full text-left p-4 space-y-1 transition-colors cursor-pointer ${
                    selected ? 'bg-sky-400/[0.09]' : 'hover:bg-white/[0.025]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm truncate ${
                        msg.status === 'unread'
                          ? 'font-semibold text-white'
                          : 'font-medium text-slate-300'
                      }`}
                    >
                      {msg.name}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 tabular-nums shrink-0">
                      {formatDate(msg.createdAtMs)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 truncate">{msg.subject}</div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="truncate">{msg.email}</span>
                    <span
                      className={`capitalize shrink-0 ${
                        msg.status === 'unread' ? 'text-sky-400 font-medium' : 'text-slate-500'
                      }`}
                    >
                      {msg.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Message Detail */}
          <div className="lg:col-span-7 p-6 flex flex-col justify-between gap-6">
            {activeMessage && (
              <>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-white">
                        {activeMessage.subject}
                      </h3>
                      <div className="text-xs text-slate-400">
                        From <span className="text-slate-200">{activeMessage.name}</span> ·{' '}
                        {activeMessage.email} ·{' '}
                        <span className="font-mono tabular-nums">
                          {formatDate(activeMessage.createdAtMs)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {activeMessage.status !== 'read' && (
                        <button
                          type="button"
                          disabled={isSyncing}
                          onClick={() => void updateMessageStatus(activeMessage.id, 'read')}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-200 border border-white/12 hover:bg-white/[0.05] cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Mark Read</span>
                        </button>
                      )}
                      {activeMessage.status !== 'archived' && (
                        <button
                          type="button"
                          disabled={isSyncing}
                          onClick={() => void updateMessageStatus(activeMessage.id, 'archived')}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 border border-white/12 hover:bg-white/[0.05] cursor-pointer"
                        >
                          <Archive className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Archive</span>
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={isSyncing}
                        onClick={() => void deleteMessage(activeMessage.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                        aria-label="Delete message"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {activeMessage.message}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-400 capitalize">
                    Status: {activeMessage.status}
                  </span>
                  <a
                    href={`mailto:${activeMessage.email}?subject=${encodeURIComponent(`Re: ${activeMessage.subject}`)}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Reply via Email</span>
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
