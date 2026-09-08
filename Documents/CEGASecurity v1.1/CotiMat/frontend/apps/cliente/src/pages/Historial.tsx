import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { fetchQuotesByPhone, getFriendlyErrorMessage } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import StatusStamp from '../components/StatusStamp';

const formSchema = z.object({
  phone: z.string().trim().regex(/^\d{10}$/, 'Ingresa un teléfono a 10 dígitos.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function Historial() {
  const [searchedPhone, setSearchedPhone] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { phone: '' },
  });

  const quotesQuery = useQuery({
    queryKey: ['quotes', searchedPhone],
    queryFn: () => fetchQuotesByPhone(searchedPhone as string),
    enabled: Boolean(searchedPhone),
  });

  const onSubmit = (values: FormValues) => {
    setSearchedPhone(values.phone);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          Tu historial
        </h1>
        <p className="mt-1 text-sm text-muted">
          Ingresa el teléfono con el que hiciste tus cotizaciones.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex items-start gap-2">
        <div className="flex-1">
          <input
            type="tel"
            inputMode="numeric"
            placeholder="5512345678"
            {...register('phone')}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-rejected">{errors.phone.message}</p>
          )}
        </div>
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90"
        >
          Buscar
        </button>
      </form>

      {quotesQuery.isLoading && (
        <p className="text-center text-sm text-muted">Buscando cotizaciones…</p>
      )}

      {quotesQuery.isError && (
        <p className="text-center text-sm text-rejected">
          {getFriendlyErrorMessage(quotesQuery.error)}
        </p>
      )}

      {quotesQuery.isSuccess && quotesQuery.data.length === 0 && (
        <div className="text-center">
          <p className="text-2xl font-semibold tracking-tight text-ink">Sin cotizaciones aún</p>
          <p className="mt-2 text-sm text-muted">
            No encontramos cotizaciones con ese teléfono. Verifica el número o arma una nueva.
          </p>
          <Link
            to="/"
            className="mt-5 inline-block rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent/90"
          >
            Ir al catálogo
          </Link>
        </div>
      )}

      {quotesQuery.data && quotesQuery.data.length > 0 && (
        <ul className="flex flex-col gap-3">
          {quotesQuery.data.map((quote) => (
            <li key={quote.id}>
              <Link
                to={`/cotizacion/${quote.folio}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-canvas"
              >
                <div>
                  <p className="text-xl font-semibold tracking-tight text-ink">{quote.folio}</p>
                  <p className="text-xs text-muted">{formatDate(quote.createdAt)}</p>
                  <p className="mt-1 text-sm font-semibold tabular-nums text-ink">
                    {formatCurrency(quote.total)}
                  </p>
                </div>
                <StatusStamp status={quote.status} className="text-sm" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
