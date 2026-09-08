import { useRef, useState } from 'react';
import { resolveImageUrl } from '../services/api';

interface ImageUploaderProps {
  currentImageUrl: string | null;
  onUpload: (file: File) => Promise<unknown> | void;
  isUploading?: boolean;
  error?: string | null;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function ImageUploader({ currentImageUrl, onUpload, isUploading, error }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setLocalError('Formato no soportado. Usa JPG, PNG o WEBP.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setLocalError('El archivo supera el máximo de 5MB.');
      return;
    }
    setLocalError(null);
    setPreview(URL.createObjectURL(file));
    void onUpload(file);
  }

  const displayUrl = preview ?? resolveImageUrl(currentImageUrl);

  return (
    <div className="panel p-4">
      <p className="field-label">Imagen del material</p>
      <div className="flex items-start gap-4">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg border border-border bg-canvas">
          {displayUrl ? (
            <img src={displayUrl} alt="Vista previa del material" className="h-full w-full rounded-lg object-cover" />
          ) : (
            <span className="px-2 text-center font-sans text-xs text-muted">Sin imagen</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? 'Subiendo…' : currentImageUrl ? 'Reemplazar imagen' : 'Subir imagen'}
          </button>
          <p className="font-sans text-xs text-muted">JPG, PNG o WEBP · máx. 5MB</p>
          {(localError || error) && <p className="field-error">{localError || error}</p>}
        </div>
      </div>
    </div>
  );
}
