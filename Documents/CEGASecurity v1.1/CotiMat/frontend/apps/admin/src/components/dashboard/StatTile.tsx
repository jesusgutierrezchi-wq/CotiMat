interface StatTileProps {
  label: string;
  value: string;
  deltaPct?: number | null;
  deltaLabel?: string;
}

/**
 * A single "hero number" KPI tile: big value, label, and an optional delta vs.
 * the previous period. The delta arrow reuses the shared approved/rejected
 * tokens as a status signal (good/bad), not as categorical identity.
 */
export function StatTile({ label, value, deltaPct, deltaLabel }: StatTileProps) {
  const hasDelta = typeof deltaPct === 'number' && Number.isFinite(deltaPct);
  const isPositive = hasDelta && deltaPct! >= 0;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-ink">{value}</p>
      {hasDelta && (
        <p className={`mt-1.5 text-sm font-medium ${isPositive ? 'text-approved' : 'text-rejected'}`}>
          {isPositive ? '▲' : '▼'} {Math.abs(deltaPct!).toFixed(0)}%
          {deltaLabel ? <span className="ml-1 font-normal text-muted">{deltaLabel}</span> : null}
        </p>
      )}
    </div>
  );
}
