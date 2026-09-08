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
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-ink">Tu historial</h1>
      <p className="mt-1 font-sans text-sm text-steel">
        Ingresa el teléfono con el que hiciste tus cotizaciones.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 flex items-start gap-2">
        <div className="flex-1">
          <input
            type="tel"
            inputMode="numeric"
            placeholder="5512345678"
            {...register('phone')}
            className="w-full border-2 border-ink bg-paper px-3 py-2.5 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-safety"
          />
          {errors.phone && (
            <p className="mt-1 font-sans text-xs text-rejected">{errors.phone.message}</p>
          )}
        </div>
        <button
          type="submit"
          className="shrink-0 bg-ink px-5 py-2.5 font-sans text-sm font-semibold text-paper hover:bg-safety"
        >
          Buscar
        </button>
      </form>

      {quotesQuery.isLoading && (
        <p className="mt-8 text-center font-sans text-sm text-steel">Buscando cotizaciones…</p>
      )}

      {quotesQuery.isError && (
        <p className="mt-8 text-center font-sans text-sm text-rejected">
          {getFriendlyErrorMessage(quotesQuery.error)}
        </p>
      )}

      {quotesQuery.isSuccess && quotesQuery.data.length === 0 && (
        <div className="mt-10 text-center">
          <p className="font-display text-2xl font-bold text-ink">Sin cotizaciones aún</p>
          <p className="mt-2 font-sans text-sm text-steel">
            No encontramos cotizaciones con ese teléfono. Verifica el número o arma una nueva.
          </p>
          <Link
            to="/"
            className="mt-5 inline-block bg-ink px-6 py-2.5 font-sans text-sm font-semibold text-paper hover:bg-safety"
          >
            Ir al catálogo
          </Link>
        </div>
      )}

      {quotesQuery.data && quotesQuery.data.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {quotesQuery.data.map((quote) => (
            <li key={quote.id}>
              <Link
                to={`/cotizacion/${quote.folio}`}
                className="flex items-center justify-between gap-3 border-2 border-ink bg-paper p-4 shadow-tag hover:shadow-tag-lg"
              >
                <div>
                  <p className="font-display text-xl font-bold text-ink">{quote.folio}</p>
                  <p className="font-sans text-xs text-steel">{formatDate(quote.createdAt)}</p>
                  <p className="mt-1 font-sans text-sm font-semibold tabular-nums text-ink">
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
