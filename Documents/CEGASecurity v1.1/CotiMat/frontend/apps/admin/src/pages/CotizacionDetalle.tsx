import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { addQuoteNote, fetchQuote, getErrorMessage, updateQuoteStatus } from '../services/api';
import { QUOTE_STATUS_LABELS, QUOTE_STATUSES, type QuoteStatus } from '../types';
import { MATERIAL_UNIT_LABELS } from '../types';
import { StatusStamp } from '../components/StatusStamp';
import { Spinner, ErrorNotice } from '../components/Spinner';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(value: number) {
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

export function CotizacionDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [statusDraft, setStatusDraft] = useState<QuoteStatus | ''>('');
  const [statusNote, setStatusNote] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');
  const [statusError, setStatusError] = useState<string | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);

  const {
    data: quote,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['quote', id],
    queryFn: () => fetchQuote(id!),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: () => updateQuoteStatus(id!, statusDraft as QuoteStatus, statusNote.trim() || undefined),
    onSuccess: () => {
      setStatusNote('');
      setStatusDraft('');
      setStatusError(null);
      queryClient.invalidateQueries({ queryKey: ['quote', id] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
    onError: (err) => setStatusError(getErrorMessage(err, 'No se pudo actualizar el estatus.')),
  });

  const noteMutation = useMutation({
    mutationFn: () => addQuoteNote(id!, followUpNote.trim()),
    onSuccess: () => {
      setFollowUpNote('');
      setNoteError(null);
      queryClient.invalidateQueries({ queryKey: ['quote', id] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
    onError: (err) => setNoteError(getErrorMessage(err, 'No se pudo agregar la nota.')),
  });

  function handleStatusSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!statusDraft) {
      setStatusError('Selecciona un estatus.');
      return;
    }
    statusMutation.mutate();
  }

  function handleNoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!followUpNote.trim()) {
      setNoteError('Escribe una nota antes de guardar.');
      return;
    }
    noteMutation.mutate();
  }

  if (isLoading) return <Spinner label="Cargando cotización…" />;
  if (isError || !quote) {
    return <ErrorNotice message={getErrorMessage(error, 'No se pudo cargar la cotización.')} />;
  }

  const notes = [...(quote.notes || [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/cotizaciones')}
        className="mb-4 font-sans text-sm font-semibold uppercase tracking-wide text-steel hover:text-ink"
      >
        ← Volver a cotizaciones
      </button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">
            Folio {quote.folio}
          </h1>
          <p className="mt-1 font-sans text-sm text-steel">Creada el {formatDateTime(quote.createdAt)}</p>
        </div>
        <StatusStamp status={quote.status} size="lg" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <section className="panel mb-6 p-4">
            <h2 className="mb-3 font-display text-xl font-bold uppercase tracking-wide text-ink">Cliente</h2>
            <dl className="grid grid-cols-1 gap-3 font-sans text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-steel">Nombre</dt>
                <dd className="text-ink">{quote.client.name || 'No proporcionado'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-steel">Teléfono</dt>
                <dd className="text-ink">{quote.client.phone}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-steel">Correo</dt>
                <dd className="text-ink">{quote.client.email || 'No proporcionado'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-steel">Dirección</dt>
                <dd className="text-ink">{quote.client.address || 'No proporcionada'}</dd>
              </div>
            </dl>
          </section>

          <section className="panel mb-6 overflow-hidden">
            <h2 className="border-b-[1.5px] border-ink px-4 py-3 font-display text-xl font-bold uppercase tracking-wide text-ink">
              Materiales
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left font-sans text-sm">
                <thead>
                  <tr className="border-b border-steel/30 bg-concrete/60 text-xs font-semibold uppercase tracking-wide text-steel">
                    <th className="px-4 py-2">Material</th>
                    <th className="px-4 py-2">Categoría</th>
                    <th className="px-4 py-2 text-right">Cantidad</th>
                    <th className="px-4 py-2 text-right">Precio unitario</th>
                    <th className="px-4 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.items.map((item) => (
                    <tr key={item.id} className="border-b border-steel/10 last:border-b-0">
                      <td className="px-4 py-2 text-ink">{item.material.name}</td>
                      <td className="px-4 py-2 text-steel">{item.material.category.name}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-ink">
                        {item.quantity} {MATERIAL_UNIT_LABELS[item.material.unit]}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums text-ink">
                        {formatCurrency(item.unitPriceAtTime)}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums font-semibold text-ink">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-[1.5px] border-ink">
                    <td colSpan={4} className="px-4 py-3 text-right font-display text-lg font-bold uppercase text-ink">
                      Total
                    </td>
                    <td className="px-4 py-3 text-right font-display text-lg font-bold tabular-nums text-ink">
                      {formatCurrency(quote.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <section className="panel p-4">
            <h2 className="mb-3 font-display text-xl font-bold uppercase tracking-wide text-ink">
              Bitácora de seguimiento
            </h2>
            {notes.length === 0 ? (
              <p className="font-sans text-sm text-steel">Aún no hay notas registradas.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {notes.map((n) => (
                  <li key={n.id} className="border-l-[3px] border-steel/40 pl-3">
                    <div className="flex flex-wrap items-center gap-2 font-sans text-xs text-steel">
                      <span className="font-semibold text-ink">{n.author.username}</span>
                      <span>{formatDateTime(n.createdAt)}</span>
                      <StatusStamp status={n.statusAtNote} size="sm" />
                    </div>
                    <p className="mt-1 font-sans text-sm text-ink">{n.note}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="panel p-4">
            <h2 className="mb-3 font-display text-xl font-bold uppercase tracking-wide text-ink">
              Cambiar estatus
            </h2>
            <form onSubmit={handleStatusSubmit}>
              <div className="mb-3">
                <label className="field-label" htmlFor="status-select">
                  Nuevo estatus
                </label>
                <select
                  id="status-select"
                  className="field-input"
                  value={statusDraft}
                  onChange={(e) => setStatusDraft(e.target.value as QuoteStatus)}
                >
                  <option value="">Selecciona…</option>
                  {QUOTE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {QUOTE_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="field-label" htmlFor="status-note">
                  Nota (opcional)
                </label>
                <textarea
                  id="status-note"
                  className="field-input min-h-[80px]"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Detalle del cambio de estatus…"
                />
              </div>
              {statusError && <p className="field-error mb-2">{statusError}</p>}
              <button type="submit" className="btn-primary w-full" disabled={statusMutation.isPending}>
                {statusMutation.isPending ? 'Actualizando…' : 'Actualizar estatus'}
              </button>
            </form>
          </section>

          <section className="panel p-4">
            <h2 className="mb-3 font-display text-xl font-bold uppercase tracking-wide text-ink">
              Agregar nota de seguimiento
            </h2>
            <form onSubmit={handleNoteSubmit}>
              <div className="mb-3">
                <label className="field-label" htmlFor="follow-up-note">
                  Nota
                </label>
                <textarea
                  id="follow-up-note"
                  className="field-input min-h-[100px]"
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  placeholder="Ej. Se contactó al cliente por teléfono…"
                />
              </div>
              {noteError && <p className="field-error mb-2">{noteError}</p>}
              <button type="submit" className="btn-secondary w-full" disabled={noteMutation.isPending}>
                {noteMutation.isPending ? 'Guardando…' : 'Agregar nota'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
