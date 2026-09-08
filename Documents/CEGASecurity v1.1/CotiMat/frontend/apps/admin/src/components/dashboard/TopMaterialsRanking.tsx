import type { DashboardTopMaterial } from '../../types';
import { MATERIAL_UNIT_LABELS } from '../../types';

interface TopMaterialsRankingProps {
  data: DashboardTopMaterial[];
}

/** Single-hue magnitude ranking: materials are distinguished by their label, not by color. */
export function TopMaterialsRanking({ data }: TopMaterialsRankingProps) {
  const max = Math.max(1, ...data.map((d) => d.timesQuoted));

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-ink">Materiales más cotizados</h2>
      {data.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Todavía no hay suficientes cotizaciones para mostrar un ranking.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {data.map((material) => (
            <li key={material.materialId}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-sm font-medium text-ink">{material.name}</span>
                <span className="shrink-0 text-xs text-muted">
                  {material.timesQuoted} {material.timesQuoted === 1 ? 'vez' : 'veces'} ·{' '}
                  {MATERIAL_UNIT_LABELS[material.unit]}
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-canvas">
                <div
                  className="h-2 rounded-full bg-accent"
                  style={{ width: `${(material.timesQuoted / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
