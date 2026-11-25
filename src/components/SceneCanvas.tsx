import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import { PortfolioScene } from '../three/PortfolioScene';

export interface SceneCanvasHandle {
  nudgeOrbit: () => void;
  resetView: () => void;
}

interface SceneCanvasProps {
  isPaused: boolean;
}

export const SceneCanvas = forwardRef<SceneCanvasHandle, SceneCanvasProps>(
  function SceneCanvas({ isPaused }, ref) {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const sceneRef = useRef<PortfolioScene | null>(null);
    const initialPausedRef = useRef<boolean>(isPaused);
    const [webglUnavailable, setWebglUnavailable] = useState(false);

    useEffect(() => {
      const container = mountRef.current;
      if (!container) return;

      const scene = new PortfolioScene(container, initialPausedRef.current, {
        onWebGLUnavailable: () => setWebglUnavailable(true),
      });
      sceneRef.current = scene;

      return () => {
        scene.dispose();
        sceneRef.current = null;
      };
    }, []);

    useEffect(() => {
      sceneRef.current?.setPaused(isPaused);
    }, [isPaused]);

    useImperativeHandle(ref, () => ({
      nudgeOrbit: () => sceneRef.current?.nudgeOrbit(),
      resetView: () => sceneRef.current?.resetView(),
    }));

    return (
      <div
        className="fixed inset-0 z-0 overflow-hidden bg-[#07090d] pointer-events-none"
        aria-hidden="true"
      >
        <div ref={mountRef} className="w-full h-full" />

        {webglUnavailable && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background:
                'radial-gradient(circle at 72% 45%, rgba(56, 189, 248, 0.16) 0%, rgba(14, 23, 38, 0.65) 38%, rgba(7, 9, 13, 1) 78%)',
            }}
          >
            <div className="w-72 h-72 rounded-full border border-sky-400/20 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full border border-slate-400/20 flex items-center justify-center">
                <div className="w-24 h-24 rotate-45 border border-sky-300/35 bg-sky-500/10" />
              </div>
            </div>
          </div>
        )}

        {/* Measured subtle edge vignette for guaranteed DOM contrast over 3D geometry */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 85% 75% at 68% 42%, transparent 25%, rgba(7, 9, 13, 0.45) 100%)',
          }}
        />
      </div>
    );
  },
);
