import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

const linkBase = 'block border-l-2 px-4 py-2.5 font-sans text-sm font-medium transition-colors';

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
    <aside className="flex h-full w-56 shrink-0 flex-col bg-sidebar text-gray-300">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-white">
          C
        </span>
        <div className="min-w-0">
          <span className="block truncate font-sans text-base font-semibold text-white">CotiMat</span>
          <p className="text-xs text-gray-500">Panel admin</p>
        </div>
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
                  ? 'border-accent bg-white/5 text-white'
                  : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white',
              ].join(' ')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        {admin && (
          <p className="mb-3 truncate font-sans text-xs text-gray-500">
            Sesión: <span className="font-medium text-gray-300">{admin.username}</span>
          </p>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg border border-white/15 px-3 py-2 font-sans text-xs font-medium text-gray-300 transition-colors hover:bg-white/5"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
