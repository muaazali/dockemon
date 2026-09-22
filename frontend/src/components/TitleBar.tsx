import * as React from 'react';
import { useEffect, useState } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';
import {
  Quit,
  WindowIsMaximised,
  WindowMinimise,
  WindowToggleMaximise,
} from '../../wailsjs/runtime/runtime';
import DockemonLogo from '@/components/DockemonLogo';

export default function TitleBar() {
  const [isMaximised, setIsMaximised] = useState(false);

  const hasWailsRuntime = typeof window !== 'undefined' && 'runtime' in window;

  useEffect(() => {
    if (!hasWailsRuntime) return;
    WindowIsMaximised().then(setIsMaximised);
  }, [hasWailsRuntime]);

  const toggleMaximise = () => {
    if (!hasWailsRuntime) return;
    WindowToggleMaximise();
    setIsMaximised((prev) => !prev);
  };

  return (
    <div
      className="relative z-50 flex h-8 shrink-0 items-center justify-between pl-3"
      style={{ '--wails-draggable': 'drag' } as React.CSSProperties}
      onDoubleClick={toggleMaximise}
    >
      <div className="flex items-center gap-2 text-xs font-medium text-foreground/50">
        <DockemonLogo className="size-3.5 text-primary" />
        <span>Dockemon</span>
      </div>
      <div className="flex h-full items-stretch" style={{ '--wails-draggable': 'no-drag' } as React.CSSProperties}>
        <button
          type="button"
          aria-label="Minimise"
          className="flex w-11 items-center justify-center text-foreground/60 transition-colors hover:bg-white/10 hover:text-foreground"
          onClick={() => hasWailsRuntime && WindowMinimise()}
        >
          <Minus className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label={isMaximised ? 'Restore' : 'Maximise'}
          className="flex w-11 items-center justify-center text-foreground/60 transition-colors hover:bg-white/10 hover:text-foreground"
          onClick={toggleMaximise}
        >
          {isMaximised ? <Copy className="size-3" /> : <Square className="size-3" />}
        </button>
        <button
          type="button"
          aria-label="Close"
          className="flex w-11 items-center justify-center text-foreground/60 transition-colors hover:bg-destructive hover:text-destructive-foreground"
          onClick={() => hasWailsRuntime && Quit()}
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
