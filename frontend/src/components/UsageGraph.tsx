import { useId } from 'react';

type UsageGraphProps = {
  label: string;
  percent: number;
  history: number[];
  colorClass?: string;
};

const WIDTH = 120;
const HEIGHT = 36;
const PAD_Y = 3;

function buildPoints(history: number[]): [number, number][] {
  const values = history.length > 0 ? history : [0];
  const padded = values.length === 1 ? [values[0], values[0]] : values;
  const span = Math.max(1, padded.length - 1);

  return padded.map((value, index) => {
    const clamped = Math.min(100, Math.max(0, value));
    const x = (index / span) * WIDTH;
    const y = HEIGHT - PAD_Y - (clamped / 100) * (HEIGHT - PAD_Y * 2);
    return [x, y];
  });
}

export default function UsageGraph({ label, percent, history, colorClass = 'text-chart-1' }: UsageGraphProps) {
  const gradientId = useId();
  const points = buildPoints(history);
  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const areaPath = `${linePath} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;
  const [lastX, lastY] = points[points.length - 1];
  const hasData = history.length > 0;

  return (
    <div className={`flex flex-col gap-1 ${colorClass}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{hasData ? `${Math.round(percent)}%` : '—'}</span>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-9 w-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {hasData && <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />}
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {hasData && (
          <>
            <circle cx={lastX} cy={lastY} r="4" fill="currentColor" opacity="0.35">
              <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0;0.35" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx={lastX} cy={lastY} r="2.5" fill="currentColor" />
          </>
        )}
      </svg>
    </div>
  );
}
