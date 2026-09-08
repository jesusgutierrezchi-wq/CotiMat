import type { MaterialUnit } from '../types';
import { MATERIAL_UNIT_LABELS } from '../types';
import { formatCurrency } from '../utils/format';
import QuantityStepper from './QuantityStepper';
import { TrashIcon } from './icons';

export interface QuoteLineView {
  id: string;
  name: string;
  unit: MaterialUnit;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface QuoteItemsTableProps {
  lines: QuoteLineView[];
  total: number;
  editable?: boolean;
  onQuantityChange?: (id: string, quantity: number) => void;
  onRemove?: (id: string) => void;
}

export default function QuoteItemsTable({
  lines,
  total,
  editable = false,
  onQuantityChange,
  onRemove,
}: QuoteItemsTableProps) {
  return (
    <div className="border-2 border-ink bg-paper shadow-tag">
      <div className="px-4 pt-4 sm:px-6 sm:pt-6">
        {lines.map((line, index) => (
          <div key={line.id}>
            {index > 0 && <div className="dashed-divider my-3" />}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-sm font-semibold text-ink">
                  {line.name}
                </p>
                <p className="font-sans text-xs text-steel tabular-nums">
                  {formatCurrency(line.unitPrice)} / {MATERIAL_UNIT_LABELS[line.unit]}
                </p>
                {editable ? (
                  <div className="mt-2 flex items-center gap-3">
                    <QuantityStepper
                      quantity={line.quantity}
                      onChange={(quantity) => onQuantityChange?.(line.id, quantity)}
                    />
                    <button
                      type="button"
                      onClick={() => onRemove?.(line.id)}
                      className="flex items-center gap-1 text-xs font-medium text-steel hover:text-rejected"
                      aria-label={`Quitar ${line.name}`}
                    >
                      <TrashIcon className="h-4 w-4" />
                      Quitar
                    </button>
                  </div>
                ) : (
                  <p className="mt-1 font-sans text-xs text-steel tabular-nums">
                    Cantidad: {line.quantity}
                  </p>
                )}
              </div>
              <p className="shrink-0 font-sans text-sm font-bold tabular-nums text-ink">
                {formatCurrency(line.subtotal)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashed-divider mx-4 mt-4 sm:mx-6" />

      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <p className="font-sans text-sm font-semibold uppercase text-steel">Total</p>
        <p className="font-display text-3xl font-bold tabular-nums text-safety">
          {formatCurrency(total)}
        </p>
      </div>
    </div>
  );
}
