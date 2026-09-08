import { Link } from 'react-router-dom';
import { useCartStore, cartCount } from '../store/cart.store';
import { CartIcon } from './icons';

export default function Header() {
  const lines = useCartStore((state) => state.lines);
  const count = cartCount(lines);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-bold text-white">
            C
          </span>
          <span className="text-lg font-semibold tracking-tight text-ink">CotiMat</span>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            to="/historial"
            className="text-sm font-medium text-muted hover:text-ink"
          >
            Historial
          </Link>
          <Link
            to="/cotizacion"
            className="relative flex items-center gap-1.5 text-ink"
            aria-label="Ver cotización actual"
          >
            <CartIcon className="h-6 w-6" />
            {count > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-semibold leading-none text-white">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
