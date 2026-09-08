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
        <p className="font-sans text-sm text-steel">Buscando tu cotización…</p>
      </div>
    );
  }

  if (quoteQuery.isError || !quoteQuery.data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <p className="font-display text-3xl font-bold text-ink">No encontramos ese folio</p>
        <p className="mt-2 font-sans text-sm text-steel">
          {quoteQuery.error ? getFriendlyErrorMessage(quoteQuery.error) : 'Verifica el folio e intenta de nuevo.'}
        </p>
        <Link
          to="/historial"
          className="mt-6 inline-block bg-ink px-6 py-2.5 font-sans text-sm font-semibold text-paper hover:bg-safety"
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
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <div className="flex items-start justify-between gap-4 border-2 border-ink bg-paper p-4 shadow-tag sm:p-6">
        <div>
          <p className="font-sans text-xs font-medium uppercase tracking-wide text-steel">Folio</p>
          <p className="font-display text-3xl font-bold text-ink">{quote.folio}</p>
          <p className="mt-1 font-sans text-xs text-steel">{formatDate(quote.createdAt)}</p>
          <p className="mt-3 font-sans text-sm text-ink">
            {quote.client.name ? `${quote.client.name} · ` : ''}
            {quote.client.phone}
          </p>
        </div>
        <StatusStamp status={quote.status} />
      </div>

      <div className="mt-5">
        <QuoteItemsTable lines={tableLines} total={quote.total} />
      </div>

      <a
        href={getQuotePdfUrl(quote.folio)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 block w-full bg-ink py-3 text-center font-sans text-sm font-semibold text-paper hover:bg-safety"
      >
        Descargar PDF
      </a>
    </div>
  );
}
