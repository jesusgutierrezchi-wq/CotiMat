import { Link } from 'react-router-dom';
import type { DashboardRecentQuote } from '../../types';
import { StatusStamp } from '../StatusStamp';

interface RecentQuotesListProps {
  data: DashboardRecentQuote[];
}

function formatCurrency(value: number) {
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

export function RecentQuotesList({ data }: RecentQuotesListProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">Cotizaciones recientes</h2>
        <Link to="/cotizaciones" className="text-sm font-medium text-accent hover:text-accent/80">
          Ver todas
        </Link>
      </div>
      {data.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Todavía no se ha creado ninguna cotización.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {data.map((quote) => (
            <li key={quote.id}>
              <Link
                to={`/cotizaciones/${quote.id}`}
                className="flex items-center justify-between gap-3 py-3 hover:bg-canvas"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {quote.clientName || quote.clientPhone}
                  </p>
                  <p className="text-xs text-muted">{quote.folio}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-medium tabular-nums text-ink">
                    {formatCurrency(quote.total)}
                  </span>
                  <StatusStamp status={quote.status} size="sm" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
