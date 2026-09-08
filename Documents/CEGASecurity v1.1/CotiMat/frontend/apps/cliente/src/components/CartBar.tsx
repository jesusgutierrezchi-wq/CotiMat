import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore, cartCount, cartTotal } from '../store/cart.store';
import { formatCurrency } from '../utils/format';

export default function CartBar() {
  const lines = useCartStore((state) => state.lines);
  const navigate = useNavigate();
  const count = cartCount(lines);
  const total = cartTotal(lines);

  const [pulsing, setPulsing] = useState(false);
  const prevCountRef = useRef(count);

  useEffect(() => {
    if (count > prevCountRef.current) {
      setPulsing(true);
      const timeout = setTimeout(() => setPulsing(false), 320);
      prevCountRef.current = count;
      return () => clearTimeout(timeout);
    }
    prevCountRef.current = count;
    return undefined;
  }, [count]);

  if (count === 0) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 rounded-xl border border-border bg-surface shadow-md sm:inset-x-4 sm:bottom-4 lg:inset-x-auto lg:bottom-auto lg:right-6 lg:top-20 lg:w-72">
      <div className="flex items-center justify-between gap-3 px-4 py-3 lg:flex-col lg:items-stretch lg:gap-3 lg:p-4">
        <div className={`flex-1 lg:flex-none ${pulsing ? 'pulse-once' : ''}`}>
          <p className="text-xs font-medium text-muted">
            {count} {count === 1 ? 'material' : 'materiales'}
          </p>
          <p className="text-xl font-semibold leading-none tabular-nums text-accent lg:text-2xl">
            {formatCurrency(total)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/cotizacion')}
          className="shrink-0 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 lg:w-full"
        >
          Ver cotización
        </button>
      </div>
    </div>
  );
}
