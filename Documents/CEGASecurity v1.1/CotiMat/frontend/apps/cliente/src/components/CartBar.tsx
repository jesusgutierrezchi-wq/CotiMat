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
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-paper shadow-tag-lg lg:inset-x-auto lg:bottom-auto lg:right-6 lg:top-20 lg:w-72 lg:border-2">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 lg:mx-0 lg:flex-col lg:items-stretch lg:gap-3 lg:p-4">
        <div className={`flex-1 lg:flex-none ${pulsing ? 'pulse-once' : ''}`}>
          <p className="font-sans text-xs font-medium text-steel">
            {count} {count === 1 ? 'material' : 'materiales'} · {formatCurrency(total)}
          </p>
          <p className="hidden font-display text-3xl font-bold leading-none text-ink lg:block">
            {formatCurrency(total)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/cotizacion')}
          className="shrink-0 bg-safety px-5 py-2.5 font-sans text-sm font-semibold text-paper hover:bg-ink lg:w-full"
        >
          Ver cotización
        </button>
      </div>
    </div>
  );
}
