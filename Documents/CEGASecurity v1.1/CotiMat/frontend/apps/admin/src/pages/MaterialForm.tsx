import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createMaterial,
  fetchCategories,
  fetchMaterial,
  getErrorMessage,
  updateMaterial,
  uploadMaterialImage,
} from '../services/api';
import { MATERIAL_UNITS, MATERIAL_UNIT_LABELS } from '../types';
import { ImageUploader } from '../components/ImageUploader';
import { Spinner, ErrorNotice } from '../components/Spinner';

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  unit: z.enum(['PIEZA', 'M2', 'M3', 'KG', 'SACO', 'LITRO', 'TONELADA']),
  unitPrice: z.coerce.number({ invalid_type_error: 'Ingresa un precio válido' }).positive('El precio debe ser mayor a 0'),
  stock: z.union([z.coerce.number().nonnegative('El stock no puede ser negativo'), z.literal('')]).optional(),
  active: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function MaterialForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const {
    data: material,
    isLoading: loadingMaterial,
    isError: materialError,
    error: materialErrorObj,
  } = useQuery({
    queryKey: ['material', id],
    queryFn: () => fetchMaterial(id!),
    enabled: isEditing,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: '',
      unit: 'PIEZA',
      unitPrice: 0,
      stock: '',
      active: true,
    },
  });

  useEffect(() => {
    if (material) {
      reset({
        name: material.name,
        description: material.description || '',
        categoryId: material.categoryId,
        unit: material.unit,
        unitPrice: material.unitPrice,
        stock: material.stock ?? '',
        active: material.active,
      });
    }
  }, [material, reset]);

  const createMutation = useMutation({
    mutationFn: (values: FormValues) =>
      createMaterial({
        name: values.name,
        description: values.description || null,
        categoryId: values.categoryId,
        unit: values.unit,
        unitPrice: Number(values.unitPrice),
        stock: values.stock === '' || values.stock === undefined ? null : Number(values.stock),
      }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      navigate(`/materiales/${created.id}/editar`, { replace: true });
    },
    onError: (err) => setSubmitError(getErrorMessage(err, 'No se pudo crear el material.')),
  });

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) =>
      updateMaterial(id!, {
        name: values.name,
        description: values.description || null,
        categoryId: values.categoryId,
        unit: values.unit,
        unitPrice: Number(values.unitPrice),
        stock: values.stock === '' || values.stock === undefined ? null : Number(values.stock),
      }),
    onSuccess: () => {
      setSubmitError(null);
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['material', id] });
    },
    onError: (err) => setSubmitError(getErrorMessage(err, 'No se pudo actualizar el material.')),
  });

  const imageMutation = useMutation({
    mutationFn: (file: File) => uploadMaterialImage(id!, file),
    onSuccess: () => {
      setImageError(null);
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['material', id] });
    },
    onError: (err) => setImageError(getErrorMessage(err, 'No se pudo subir la imagen.')),
  });

  function onSubmit(values: FormValues) {
    setSubmitError(null);
    if (isEditing) updateMutation.mutate(values);
    else createMutation.mutate(values);
  }

  if (isEditing && loadingMaterial) return <Spinner label="Cargando material…" />;
  if (isEditing && materialError) {
    return <ErrorNotice message={getErrorMessage(materialErrorObj, 'No se pudo cargar el material.')} />;
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/materiales')}
        className="mb-4 font-sans text-sm font-medium text-muted hover:text-ink"
      >
        ← Volver a materiales
      </button>

      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-ink">
        {isEditing ? 'Editar material' : 'Nuevo material'}
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit(onSubmit)} className="panel p-5 lg:col-span-2" noValidate>
          <div className="mb-4">
            <label className="field-label" htmlFor="name">
              Nombre
            </label>
            <input id="name" className="field-input" {...register('name')} />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>

          <div className="mb-4">
            <label className="field-label" htmlFor="description">
              Descripción
            </label>
            <textarea id="description" className="field-input min-h-[80px]" {...register('description')} />
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="categoryId">
                Categoría
              </label>
              <select id="categoryId" className="field-input" disabled={loadingCategories} {...register('categoryId')}>
                <option value="">Selecciona…</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="field-error">{errors.categoryId.message}</p>}
            </div>

            <div>
              <label className="field-label" htmlFor="unit">
                Unidad
              </label>
              <select id="unit" className="field-input" {...register('unit')}>
                {MATERIAL_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {MATERIAL_UNIT_LABELS[u]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="unitPrice">
                Precio unitario
              </label>
              <input
                id="unitPrice"
                type="number"
                step="0.01"
                min="0"
                className="field-input"
                {...register('unitPrice')}
              />
              {errors.unitPrice && <p className="field-error">{errors.unitPrice.message}</p>}
            </div>

            <div>
              <label className="field-label" htmlFor="stock">
                Stock (opcional)
              </label>
              <input id="stock" type="number" step="1" min="0" className="field-input" {...register('stock')} />
              {errors.stock && <p className="field-error">{errors.stock.message}</p>}
            </div>
          </div>

          {submitError && <p className="field-error mb-3">{submitError}</p>}

          <button type="submit" className="btn-primary" disabled={isSaving}>
            {isSaving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear material'}
          </button>
          {!isEditing && (
            <p className="mt-2 font-sans text-xs text-muted">
              Tras crear el material podrás subir su imagen en la siguiente pantalla.
            </p>
          )}
        </form>

        <div>
          {isEditing && material ? (
            <ImageUploader
              currentImageUrl={material.imageUrl}
              onUpload={(file) => imageMutation.mutateAsync(file)}
              isUploading={imageMutation.isPending}
              error={imageError}
            />
          ) : (
            <div className="panel p-4 font-sans text-sm text-muted">
              Guarda el material para habilitar la carga de imagen.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
