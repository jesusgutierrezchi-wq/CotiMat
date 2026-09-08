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
    <article className="flex flex-col border-2 border-ink bg-paper shadow-tag">
      <div className="relative aspect-square w-full overflow-hidden border-b-2 border-ink bg-concrete">
        {image ? (
          <img
            src={image}
            alt={material.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <StackIcon className="h-10 w-10 text-steel/50" />
          </div>
        )}
        <span className="absolute left-0 top-0 border-b-2 border-r-2 border-ink bg-paper px-2 py-0.5 font-sans text-[11px] font-bold uppercase tracking-wide text-steel">
          {MATERIAL_UNIT_LABELS[material.unit]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <p className="text-[11px] font-medium text-steel">{material.category.name}</p>
          <h3 className="font-sans text-sm font-semibold leading-snug text-ink line-clamp-2">
            {material.name}
          </h3>
        </div>

        <p className="mt-auto font-display text-2xl font-bold leading-none text-safety">
          {formatCurrency(material.unitPrice)}
        </p>

        <div className="flex flex-col gap-2">
          <QuantityStepper quantity={quantity} onChange={setQuantity} />
          <button
            type="button"
            onClick={handleAdd}
            className="h-9 w-full bg-ink font-sans text-sm font-semibold text-paper hover:bg-safety"
          >
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}
