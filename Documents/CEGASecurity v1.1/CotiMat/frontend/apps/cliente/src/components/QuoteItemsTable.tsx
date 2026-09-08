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
    <div className="rounded-xl border border-border bg-surface">
      <div className="px-4 sm:px-6">
        {lines.map((line, index) => (
          <div
            key={line.id}
            className={`flex items-start justify-between gap-3 py-3 ${
              index < lines.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{line.name}</p>
              <p className="text-xs text-muted tabular-nums">
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
                    className="flex items-center gap-1 text-xs font-medium text-muted hover:text-rejected"
                    aria-label={`Quitar ${line.name}`}
                  >
                    <TrashIcon className="h-4 w-4" />
                    Quitar
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-xs text-muted tabular-nums">
                  Cantidad: {line.quantity}
                </p>
              )}
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums text-ink">
              {formatCurrency(line.subtotal)}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-border px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">Total</p>
          <p className="text-2xl font-semibold tabular-nums text-accent">
            {formatCurrency(total)}
          </p>
        </div>
      </div>
    </div>
  );
}
