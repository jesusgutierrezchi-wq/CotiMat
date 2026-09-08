interface QuantityStepperProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

export default function QuantityStepper({
  quantity,
  onChange,
  min = 1,
  max = 9999,
}: QuantityStepperProps) {
  return (
    <div className="flex h-9 items-stretch overflow-hidden rounded-full border border-border bg-surface">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        className="w-9 shrink-0 text-base font-semibold text-ink hover:bg-canvas"
        aria-label="Disminuir cantidad"
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        value={quantity}
        onChange={(event) => {
          const parsed = Number(event.target.value);
          if (Number.isFinite(parsed)) {
            onChange(Math.min(max, Math.max(min, Math.trunc(parsed))));
          }
        }}
        className="w-11 border-x border-border bg-surface text-center text-sm font-semibold tabular-nums text-ink focus:outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, quantity + 1))}
        className="w-9 shrink-0 text-base font-semibold text-ink hover:bg-canvas"
        aria-label="Aumentar cantidad"
      >
        +
      </button>
    </div>
  );
}
