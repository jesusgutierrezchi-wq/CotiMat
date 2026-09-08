import { useQuery } from '@tanstack/react-query';
import { fetchDashboard, getErrorMessage } from '../services/api';
import { StatTile } from '../components/dashboard/StatTile';
import { QuotesTrendChart } from '../components/dashboard/QuotesTrendChart';
import { StatusBreakdown } from '../components/dashboard/StatusBreakdown';
import { TopMaterialsRanking } from '../components/dashboard/TopMaterialsRanking';
import { RecentQuotesList } from '../components/dashboard/RecentQuotesList';
import { Spinner, ErrorNotice } from '../components/Spinner';

function formatCurrency(value: number) {
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
}

function monthDeltaPct(thisMonth: number, lastMonth: number): number | null {
  if (lastMonth === 0) return thisMonth > 0 ? 100 : null;
  return ((thisMonth - lastMonth) / lastMonth) * 100;
}

export function Dashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Un vistazo rápido a cómo va el negocio.</p>
      </div>

      {isLoading && <Spinner label="Cargando dashboard…" />}
      {isError && <ErrorNotice message={getErrorMessage(error)} />}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Cotizaciones totales" value={data.totals.quotesAllTime.toString()} />
            <StatTile
              label="Cotizaciones este mes"
              value={data.totals.quotesThisMonth.toString()}
              deltaPct={monthDeltaPct(data.totals.quotesThisMonth, data.totals.quotesLastMonth)}
              deltaLabel="vs. mes anterior"
            />
            <StatTile label="Valor total cotizado" value={formatCurrency(data.totals.totalQuotedAmount)} />
            <StatTile
              label="Tasa de conversión"
              value={`${(data.totals.conversionRate * 100).toFixed(0)}%`}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <QuotesTrendChart data={data.quotesByDay} />
            </div>
            <StatusBreakdown data={data.statusBreakdown} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TopMaterialsRanking data={data.topMaterials} />
            <RecentQuotesList data={data.recentQuotes} />
          </div>
        </>
      )}
    </div>
  );
}
