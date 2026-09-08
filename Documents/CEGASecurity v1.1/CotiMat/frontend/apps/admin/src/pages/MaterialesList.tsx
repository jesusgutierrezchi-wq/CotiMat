import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  deactivateMaterial,
  fetchCategories,
  fetchMaterials,
  getErrorMessage,
  resolveImageUrl,
} from '../services/api';
import { MATERIAL_UNIT_LABELS } from '../types';
import { Pagination } from '../components/Pagination';
import { Spinner, ErrorNotice, EmptyState } from '../components/Spinner';

const PAGE_SIZE = 20;

function formatCurrency(value: number) {
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

export function MaterialesList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [pendingDeactivateId, setPendingDeactivateId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const includeInactive = params.get('includeInactive') === 'true';
  const page = Number(params.get('page') || '1');

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setParams(next);
  }

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['materials', { search, category, includeInactive, page }],
    queryFn: () => fetchMaterials({ search, category, includeInactive, page, pageSize: PAGE_SIZE }),
    placeholderData: (prev) => prev,
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateMaterial(id),
    onSuccess: () => {
      setActionError(null);
      setPendingDeactivateId(null);
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
    onError: (err) => {
      setActionError(getErrorMessage(err, 'No se pudo desactivar el material.'));
      setPendingDeactivateId(null);
    },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">Materiales</h1>
        <button type="button" className="btn-primary" onClick={() => navigate('/materiales/nuevo')}>
          Nuevo material
        </button>
      </div>

      <div className="panel mb-4 grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="field-label" htmlFor="m-search">
            Buscar
          </label>
          <input
            id="m-search"
            className="field-input"
            defaultValue={search}
            placeholder="Nombre del material"
            onBlur={(e) => updateParam('search', e.target.value.trim())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateParam('search', (e.target as HTMLInputElement).value.trim());
            }}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="m-category">
            Categoría
          </label>
          <select
            id="m-category"
            className="field-input"
            value={category}
            onChange={(e) => updateParam('category', e.target.value)}
          >
            <option value="">Todas</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 font-sans text-sm text-ink">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => updateParam('includeInactive', e.target.checked ? 'true' : '')}
              className="h-4 w-4 border-[1.5px] border-ink accent-blueprint"
            />
            Incluir inactivos
          </label>
        </div>
      </div>

      {actionError && (
        <div className="mb-4">
          <ErrorNotice message={actionError} />
        </div>
      )}

      <div className="panel overflow-hidden">
        {isLoading ? (
          <Spinner label="Cargando materiales…" />
        ) : isError ? (
          <div className="p-4">
            <ErrorNotice message={getErrorMessage(error, 'No se pudieron cargar los materiales.')} />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-4">
            <EmptyState message="No hay materiales que coincidan con los filtros." />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left font-sans text-sm">
                <thead>
                  <tr className="border-b-[1.5px] border-ink bg-concrete/60 text-xs font-semibold uppercase tracking-wide text-steel">
                    <th className="px-4 py-3">Imagen</th>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3">Unidad</th>
                    <th className="px-4 py-3 text-right">Precio</th>
                    <th className="px-4 py-3">Estatus</th>
                    <th className="px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((material) => {
                    const imgUrl = resolveImageUrl(material.imageUrl);
                    return (
                      <tr key={material.id} className="border-b border-steel/20 last:border-b-0 hover:bg-blueprint/5">
                        <td className="px-4 py-2">
                          <div className="flex h-12 w-12 items-center justify-center border-[1.5px] border-ink bg-concrete">
                            {imgUrl ? (
                              <img src={imgUrl} alt={material.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-[10px] text-steel">S/I</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 font-semibold text-ink">{material.name}</td>
                        <td className="px-4 py-2 text-steel">{material.category.name}</td>
                        <td className="px-4 py-2 text-steel">{MATERIAL_UNIT_LABELS[material.unit]}</td>
                        <td className="px-4 py-2 text-right tabular-nums text-ink">
                          {formatCurrency(material.unitPrice)}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={
                              material.active
                                ? 'border-[1.5px] border-approved px-2 py-0.5 text-xs font-semibold uppercase text-approved'
                                : 'border-[1.5px] border-steel px-2 py-0.5 text-xs font-semibold uppercase text-steel'
                            }
                          >
                            {material.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="btn-ghost border-[1.5px] border-ink px-2 py-1 text-xs shadow-none"
                              onClick={() => navigate(`/materiales/${material.id}/editar`)}
                            >
                              Editar
                            </button>
                            {material.active && (
                              <button
                                type="button"
                                className="btn-ghost border-[1.5px] border-rejected px-2 py-1 text-xs text-rejected shadow-none"
                                disabled={deactivateMutation.isPending && pendingDeactivateId === material.id}
                                onClick={() => {
                                  setPendingDeactivateId(material.id);
                                  deactivateMutation.mutate(material.id);
                                }}
                              >
                                {deactivateMutation.isPending && pendingDeactivateId === material.id
                                  ? 'Desactivando…'
                                  : 'Desactivar'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
          <div className="border-t border-steel/20 px-4 py-2 font-sans text-xs text-steel">Actualizando…</div>
        )}
      </div>
    </div>
  );
}
