import { useState } from 'react';
import type { Material } from '../types';
import { MATERIAL_UNIT_LABELS } from '../types';
import { resolveImageUrl } from '../services/api';
import { formatCurrency } from '../utils/format';
import { useCartStore } from '../store/cart.store';
import QuantityStepper from './QuantityStepper';
import { StackIcon } from './icons';

interface MaterialCardProps {
  material: Material;
}

export default function MaterialCard({ material }: MaterialCardProps) {
  const [quantity, setQuantity] = useState(1);
  const addMaterial = useCartStore((state) => state.addMaterial);
  const image = resolveImageUrl(material.imageUrl);

  const handleAdd = () => {
    addMaterial(material, quantity);
    setQuantity(1);
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
      <div className="relative aspect-square w-full overflow-hidden bg-canvas">
        {image ? (
          <img
            src={image}
            alt={material.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <StackIcon className="h-10 w-10 text-muted/50" />
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-canvas px-2.5 py-0.5 text-[11px] font-medium text-muted">
          {MATERIAL_UNIT_LABELS[material.unit]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <p className="text-[11px] font-medium text-muted">{material.category.name}</p>
          <h3 className="text-sm font-semibold leading-snug text-ink line-clamp-2">
            {material.name}
          </h3>
        </div>

        <p className="mt-auto text-xl font-semibold leading-none tabular-nums text-ink">
          {formatCurrency(material.unitPrice)}
        </p>

        <div className="flex flex-col gap-2">
          <QuantityStepper quantity={quantity} onChange={setQuantity} />
          <button
            type="button"
            onClick={handleAdd}
            className="h-9 w-full rounded-lg bg-accent text-sm font-semibold text-white hover:bg-accent/90"
          >
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}
