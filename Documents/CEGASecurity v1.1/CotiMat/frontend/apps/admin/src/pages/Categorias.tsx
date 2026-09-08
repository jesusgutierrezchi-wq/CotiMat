import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCategory, deleteCategory, fetchCategories, getErrorMessage, updateCategory } from '../services/api';
import type { Category } from '../types';
import { Spinner, ErrorNotice, EmptyState } from '../components/Spinner';

export function Categorias() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [rowError, setRowError] = useState<Record<string, string>>({});

  const { data: categories, isLoading, isError, error } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  }

  const createMutation = useMutation({
    mutationFn: (name: string) => createCategory(name),
    onSuccess: () => {
      setNewName('');
      setCreateError(null);
      invalidate();
    },
    onError: (err) => setCreateError(getErrorMessage(err, 'No se pudo crear la categoría.')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateCategory(id, name),
    onSuccess: (_data, variables) => {
      setEditingId(null);
      setRowError((prev) => ({ ...prev, [variables.id]: '' }));
      invalidate();
    },
    onError: (err, variables) =>
      setRowError((prev) => ({ ...prev, [variables.id]: getErrorMessage(err, 'No se pudo actualizar.') })),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: (_data, id) => {
      setRowError((prev) => ({ ...prev, [id]: '' }));
      invalidate();
    },
    onError: (err, id) =>
      setRowError((prev) => ({ ...prev, [id]: getErrorMessage(err, 'No se pudo eliminar la categoría.') })),
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) {
      setCreateError('Ingresa un nombre.');
      return;
    }
    createMutation.mutate(newName.trim());
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditingName(category.name);
  }

  function handleSaveEdit(id: string) {
    if (!editingName.trim()) {
      setRowError((prev) => ({ ...prev, [id]: 'El nombre no puede estar vacío.' }));
      return;
    }
    updateMutation.mutate({ id, name: editingName.trim() });
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-bold uppercase tracking-wide text-ink">Categorías</h1>

      <form onSubmit={handleCreate} className="panel mb-6 flex flex-wrap items-end gap-3 p-4">
        <div className="flex-1 min-w-[220px]">
          <label className="field-label" htmlFor="new-category">
            Nueva categoría
          </label>
          <input
            id="new-category"
            className="field-input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ej. Cementos"
          />
        </div>
        <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Creando…' : 'Crear'}
        </button>
      </form>
      {createError && (
        <div className="mb-4">
          <ErrorNotice message={createError} />
        </div>
      )}

      <div className="panel overflow-hidden">
        {isLoading ? (
          <Spinner label="Cargando categorías…" />
        ) : isError ? (
          <div className="p-4">
            <ErrorNotice message={getErrorMessage(error, 'No se pudieron cargar las categorías.')} />
          </div>
        ) : !categories || categories.length === 0 ? (
          <div className="p-4">
            <EmptyState message="Aún no hay categorías registradas." />
          </div>
        ) : (
          <ul>
            {categories.map((category) => {
              const isEditingRow = editingId === category.id;
              return (
                <li
                  key={category.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-steel/20 px-4 py-3 last:border-b-0"
                >
                  {isEditingRow ? (
                    <input
                      className="field-input max-w-xs flex-1"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <span className="font-sans text-sm font-semibold text-ink">{category.name}</span>
                  )}

                  <div className="flex items-center gap-2">
                    {isEditingRow ? (
                      <>
                        <button
                          type="button"
                          className="btn-secondary px-3 py-1.5 text-xs"
                          onClick={() => handleSaveEdit(category.id)}
                          disabled={updateMutation.isPending}
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          className="btn-ghost px-3 py-1.5 text-xs"
                          onClick={() => setEditingId(null)}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn-ghost border-[1.5px] border-ink px-3 py-1.5 text-xs shadow-none"
                          onClick={() => startEdit(category)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn-ghost border-[1.5px] border-rejected px-3 py-1.5 text-xs text-rejected shadow-none"
                          disabled={deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate(category.id)}
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>

                  {rowError[category.id] && (
                    <div className="w-full">
                      <p className="field-error">{rowError[category.id]}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
