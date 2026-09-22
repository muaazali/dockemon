type UsageMeterProps = {
  label: string;
  percent: number;
  detail?: string;
};

export default function UsageMeter({ label, percent, detail }: UsageMeterProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const color =
    clamped >= 90 ? 'bg-destructive' : clamped >= 75 ? 'bg-amber-400' : 'bg-primary';

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">
          {Number.isFinite(percent) ? `${clamped.toFixed(0)}%` : '—'}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {detail && <span className="text-[10px] text-muted-foreground">{detail}</span>}
    </div>
  );
}
