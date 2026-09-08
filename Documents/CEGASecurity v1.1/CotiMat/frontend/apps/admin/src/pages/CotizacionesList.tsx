import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchQuotes } from '../services/api';
import { getErrorMessage } from '../services/api';
import { QUOTE_STATUS_LABELS, QUOTE_STATUSES, type QuoteStatus } from '../types';
import { StatusStamp } from '../components/StatusStamp';
import { Pagination } from '../components/Pagination';
import { Spinner, ErrorNotice, EmptyState } from '../components/Spinner';

const PAGE_SIZE = 20;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: '2-digit' });
}

function formatCurrency(value: number) {
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

export function CotizacionesList() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const status = (params.get('status') || '') as QuoteStatus | '';
  const dateFrom = params.get('dateFrom') || '';
  const dateTo = params.get('dateTo') || '';
  const search = params.get('search') || '';
  const page = Number(params.get('page') || '1');

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setParams(next);
  }

  const queryKey = useMemo(
    () => ['quotes', { status, dateFrom, dateTo, search, page }],
    [status, dateFrom, dateTo, search, page]
  );

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey,
    queryFn: () =>
      fetchQuotes({
        status: status || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        search: search || undefined,
        page,
        pageSize: PAGE_SIZE,
      }),
    placeholderData: (prev) => prev,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Cotizaciones</h1>
      </div>

      <div className="panel mb-4 grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="field-label" htmlFor="f-search">
            Buscar (nombre o teléfono)
          </label>
          <input
            id="f-search"
            className="field-input"
            defaultValue={search}
            placeholder="Ej. 555 1234 5678"
            onBlur={(e) => updateParam('search', e.target.value.trim())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateParam('search', (e.target as HTMLInputElement).value.trim());
            }}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="f-status">
            Estatus
          </label>
          <select
            id="f-status"
            className="field-input"
            value={status}
            onChange={(e) => updateParam('status', e.target.value)}
          >
            <option value="">Todos</option>
            {QUOTE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {QUOTE_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="f-from">
            Desde
          </label>
          <input
            id="f-from"
            type="date"
            className="field-input"
            value={dateFrom}
            onChange={(e) => updateParam('dateFrom', e.target.value)}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="f-to">
            Hasta
          </label>
          <input
            id="f-to"
            type="date"
            className="field-input"
            value={dateTo}
            onChange={(e) => updateParam('dateTo', e.target.value)}
          />
        </div>
      </div>

      <div className="panel overflow-hidden">
        {isLoading ? (
          <Spinner label="Cargando cotizaciones…" />
        ) : isError ? (
          <div className="p-4">
            <ErrorNotice message={getErrorMessage(error, 'No se pudieron cargar las cotizaciones.')} />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-4">
            <EmptyState message="No hay cotizaciones que coincidan con los filtros." />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left font-sans text-sm">
                <thead>
                  <tr className="border-b border-border bg-canvas text-xs font-medium text-muted">
                    <th className="px-4 py-3">Folio</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3">Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((quote) => (
                    <tr
                      key={quote.id}
                      className="cursor-pointer border-b border-border last:border-b-0 hover:bg-canvas"
                      onClick={() => navigate(`/cotizaciones/${quote.id}`)}
                    >
                      <td className="px-4 py-3 font-semibold text-ink">{quote.folio}</td>
                      <td className="px-4 py-3 text-ink">
                        {quote.client?.name || quote.client?.phone || 'Sin datos'}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-muted">{formatDate(quote.createdAt)}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-ink">
                        {formatCurrency(quote.total)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusStamp status={quote.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={data.page}
              pageSize={data.pageSize}
              total={data.total}
              onPageChange={(p) => updateParam('page', String(p))}
            />
          </>
        )}
        {isFetching && !isLoading && (
          <div className="border-t border-border px-4 py-2 font-sans text-xs text-muted">Actualizando…</div>
        )}
      </div>
    </div>
  );
}
