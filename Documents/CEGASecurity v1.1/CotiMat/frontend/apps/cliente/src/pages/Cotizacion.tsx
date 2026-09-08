import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCartStore, cartTotal } from '../store/cart.store';
import { createQuote, getFriendlyErrorMessage } from '../services/api';
import QuoteItemsTable, { type QuoteLineView } from '../components/QuoteItemsTable';

const formSchema = z.object({
  clientPhone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'Ingresa un teléfono a 10 dígitos, sin espacios ni guiones.'),
  clientName: z.string().trim().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Cotizacion() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const lines = useCartStore((state) => state.lines);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeLine = useCartStore((state) => state.removeLine);
  const clearCart = useCartStore((state) => state.clear);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { clientPhone: '', clientName: '' },
  });

  const tableLines: QuoteLineView[] = useMemo(
    () =>
      lines.map((line) => ({
        id: line.materialId,
        name: line.name,
        unit: line.unit,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        subtotal: line.unitPrice * line.quantity,
      })),
    [lines]
  );
  const total = cartTotal(lines);

  const mutation = useMutation({
    mutationFn: createQuote,
    onSuccess: (quote) => {
      queryClient.setQueryData(['quote', quote.folio], quote);
      clearCart();
      navigate(`/cotizacion/${quote.folio}`);
    },
    onError: (error) => {
      setSubmitError(getFriendlyErrorMessage(error));
    },
  });

  const onSubmit = (values: FormValues) => {
    setSubmitError(null);
    mutation.mutate({
      clientPhone: values.clientPhone,
      clientName: values.clientName || undefined,
      items: lines.map((line) => ({
        materialId: line.materialId,
        quantity: line.quantity,
      })),
    });
  };

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <p className="font-display text-3xl font-bold text-ink">Tu cotización está vacía</p>
        <p className="mt-2 font-sans text-sm text-steel">
          Agrega materiales del catálogo para armar tu cotización.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block bg-ink px-6 py-2.5 font-sans text-sm font-semibold text-paper hover:bg-safety"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-ink">Tu cotización</h1>
      <p className="mt-1 font-sans text-sm text-steel">
        Revisa cantidades y envíanos tus datos para generar tu folio.
      </p>

      <div className="mt-5">
        <QuoteItemsTable
          lines={tableLines}
          total={total}
          editable
          onQuantityChange={setQuantity}
          onRemove={removeLine}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 border-2 border-ink bg-paper p-4 shadow-tag sm:p-6">
        <h2 className="font-display text-xl font-bold text-ink">Tus datos</h2>

        <div className="mt-4">
          <label htmlFor="clientPhone" className="block font-sans text-sm font-medium text-ink">
            Teléfono (10 dígitos)
          </label>
          <input
            id="clientPhone"
            type="tel"
            inputMode="numeric"
            placeholder="5512345678"
            {...register('clientPhone')}
            className="mt-1 w-full border-2 border-ink bg-paper px-3 py-2.5 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-safety"
          />
          {errors.clientPhone && (
            <p className="mt-1 font-sans text-xs text-rejected">{errors.clientPhone.message}</p>
          )}
        </div>

        <div className="mt-4">
          <label htmlFor="clientName" className="block font-sans text-sm font-medium text-ink">
            Nombre (opcional)
          </label>
          <input
            id="clientName"
            type="text"
            placeholder="¿Cómo te llamas?"
            {...register('clientName')}
            className="mt-1 w-full border-2 border-ink bg-paper px-3 py-2.5 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-safety"
          />
        </div>

        {submitError && (
          <p className="mt-4 border-2 border-rejected bg-rejected/10 px-3 py-2 font-sans text-sm text-rejected">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="mt-5 w-full bg-safety py-3 font-sans text-sm font-semibold text-paper hover:bg-ink disabled:opacity-60"
        >
          {mutation.isPending ? 'Enviando…' : 'Enviar cotización'}
        </button>
      </form>
    </div>
  );
}
