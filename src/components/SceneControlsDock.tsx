import { useState } from 'react';
import { ChevronDown, ChevronUp, Compass, Pause, Play, RotateCw } from 'lucide-react';

interface SceneControlsDockProps {
  isPaused: boolean;
  onTogglePause: () => void;
  onNudgeOrbit: () => void;
  onResetView: () => void;
}

export function SceneControlsDock({
  isPaused,
  onTogglePause,
  onNudgeOrbit,
  onResetView,
}: SceneControlsDockProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-auto"
      role="region"
      aria-label="3D scene controls"
    >
      {collapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-expanded={false}
          className="glass-dock inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:border-sky-400/40 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <ChevronUp className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
          <span>Show 3D Controls</span>
        </button>
      ) : (
        <div className="glass-dock rounded-xl px-2 py-1.5 flex items-center gap-1 sm:gap-1.5 max-w-[94vw]">
          <button
            type="button"
            onClick={onTogglePause}
            aria-pressed={isPaused}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
              isPaused
                ? 'bg-sky-400 text-slate-950 hover:bg-sky-300'
                : 'bg-white/[0.07] text-slate-100 hover:bg-white/[0.12]'
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                <span>Resume 3D</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Pause 3D</span>
              </>
            )}
          </button>

          <div className="w-px h-5 bg-white/10 mx-0.5" aria-hidden="true" />

          <button
            type="button"
            onClick={onNudgeOrbit}
            title="Rotate geometric core"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span className="hidden sm:inline">Rotate</span>
          </button>

          <button
            type="button"
            onClick={onResetView}
            title="Reset camera angle"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <Compass className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <div className="w-px h-5 bg-white/10 mx-0.5" aria-hidden="true" />

          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Hide 3D controls"
            aria-expanded={true}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
