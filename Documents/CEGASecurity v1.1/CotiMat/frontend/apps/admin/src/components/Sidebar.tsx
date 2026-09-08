import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

const linkBase =
  'block border-l-4 px-4 py-3 font-sans text-sm font-semibold uppercase tracking-wide transition-colors';

const navItems = [
  { to: '/cotizaciones', label: 'Cotizaciones' },
  { to: '/materiales', label: 'Materiales' },
  { to: '/categorias', label: 'Categorías' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const admin = useAuthStore((s) => s.admin);
  const clearSession = useAuthStore((s) => s.clearSession);

  function handleLogout() {
    clearSession();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col bg-blueprint text-paper">
      <div className="border-b border-paper/20 px-4 py-5">
        <span className="font-display text-2xl font-bold uppercase tracking-wide">CotiMat</span>
        <p className="mt-0.5 font-sans text-xs uppercase tracking-wide text-paper/60">Panel admin</p>
      </div>

      <nav className="flex-1 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                linkBase,
                isActive
                  ? 'border-safety bg-paper/10 text-paper'
                  : 'border-transparent text-paper/70 hover:border-paper/40 hover:bg-paper/5 hover:text-paper',
              ].join(' ')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-paper/20 px-4 py-4">
        {admin && (
          <p className="mb-3 truncate font-sans text-xs text-paper/60">
            Sesión: <span className="font-semibold text-paper/90">{admin.username}</span>
          </p>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full border-[1.5px] border-paper/60 px-3 py-2 font-sans text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:border-paper hover:bg-paper/10"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
