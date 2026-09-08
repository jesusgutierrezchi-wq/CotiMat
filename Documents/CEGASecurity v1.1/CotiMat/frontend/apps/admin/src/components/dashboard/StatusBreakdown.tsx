import type { DashboardStatusCount } from '../../types';
import { StatusStamp } from '../StatusStamp';

interface StatusBreakdownProps {
  data: DashboardStatusCount[];
}

/**
 * Deliberately a labelled bar list, not a donut/pie: the status palette
 * (aprobada/rechazada especially) fails colorblind-separation checks when used
 * as color-only identity in a legend. Reusing StatusStamp puts the status name
 * on every row, so identity never depends on distinguishing two hues apart.
 */
export function StatusBreakdown({ data }: StatusBreakdownProps) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-ink">Cotizaciones por estatus</h2>
      <ul className="mt-4 space-y-3">
        {data.map((row) => (
          <li key={row.status} className="flex items-center gap-3">
            <StatusStamp status={row.status} size="sm" className="w-[132px] shrink-0 justify-center" />
            <div className="h-2 flex-1 rounded-full bg-canvas">
              <div
                className="h-2 rounded-full bg-ink/80"
                style={{ width: `${(row.count / max) * 100}%` }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-sm font-medium tabular-nums text-ink">
              {row.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
