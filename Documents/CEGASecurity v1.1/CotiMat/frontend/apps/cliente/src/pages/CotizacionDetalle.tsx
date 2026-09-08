import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchQuoteByFolio, getFriendlyErrorMessage, getQuotePdfUrl } from '../services/api';
import { formatDate } from '../utils/format';
import StatusStamp from '../components/StatusStamp';
import QuoteItemsTable, { type QuoteLineView } from '../components/QuoteItemsTable';

export default function CotizacionDetalle() {
  const { folio = '' } = useParams<{ folio: string }>();

  const quoteQuery = useQuery({
    queryKey: ['quote', folio],
    queryFn: () => fetchQuoteByFolio(folio),
    enabled: folio.length > 0,
  });

  if (quoteQuery.isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <p className="text-sm text-muted">Buscando tu cotización…</p>
      </div>
    );
  }

  if (quoteQuery.isError || !quoteQuery.data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <p className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          No encontramos ese folio
        </p>
        <p className="mt-2 text-sm text-muted">
          {quoteQuery.error ? getFriendlyErrorMessage(quoteQuery.error) : 'Verifica el folio e intenta de nuevo.'}
        </p>
        <Link
          to="/historial"
          className="mt-6 inline-block rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent/90"
        >
          Ir a mi historial
        </Link>
      </div>
    );
  }

  const quote = quoteQuery.data;
  const tableLines: QuoteLineView[] = quote.items.map((item) => ({
    id: item.id,
    name: item.material.name,
    unit: item.material.unit,
    quantity: item.quantity,
    unitPrice: item.unitPriceAtTime,
    subtotal: item.subtotal,
  }));

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-6">
      <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface p-4 sm:p-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Folio</p>
          <p className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">{quote.folio}</p>
          <p className="mt-1 text-xs text-muted">{formatDate(quote.createdAt)}</p>
          <p className="mt-3 text-sm text-ink">
            {quote.client.name ? `${quote.client.name} · ` : ''}
            {quote.client.phone}
          </p>
        </div>
        <StatusStamp status={quote.status} />
      </div>

      <QuoteItemsTable lines={tableLines} total={quote.total} />

      <a
        href={getQuotePdfUrl(quote.folio)}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded-lg bg-accent py-3 text-center text-sm font-semibold text-white hover:bg-accent/90"
      >
        Descargar PDF
      </a>
    </div>
  );
}
