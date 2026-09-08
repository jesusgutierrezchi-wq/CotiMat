import { Link } from 'react-router-dom';
import { useCartStore, cartCount } from '../store/cart.store';
import { CartIcon } from './icons';

export default function Header() {
  const lines = useCartStore((state) => state.lines);
  const count = cartCount(lines);

  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink bg-paper">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="font-display text-2xl font-bold tracking-tight text-ink">
          Coti<span className="text-safety">Mat</span>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            to="/historial"
            className="font-sans text-sm font-medium text-steel hover:text-ink"
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
              <span className="flex h-5 min-w-5 items-center justify-center border border-ink bg-safety px-1 font-display text-xs font-bold leading-none text-paper">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
