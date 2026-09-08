import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedLayout } from './components/ProtectedLayout';
import { Login } from './pages/Login';
import { CotizacionesList } from './pages/CotizacionesList';
import { CotizacionDetalle } from './pages/CotizacionDetalle';
import { MaterialesList } from './pages/MaterialesList';
import { MaterialForm } from './pages/MaterialForm';
import { Categorias } from './pages/Categorias';
import { Spinner } from './components/Spinner';

// Cargado bajo demanda: recharts (usado solo aquí) agrega ~230KB gzip al bundle.
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedLayout />}>
        <Route
          path="/"
          element={
            <Suspense fallback={<Spinner label="Cargando dashboard…" />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route path="/cotizaciones" element={<CotizacionesList />} />
        <Route path="/cotizaciones/:id" element={<CotizacionDetalle />} />
        <Route path="/materiales" element={<MaterialesList />} />
        <Route path="/materiales/nuevo" element={<MaterialForm />} />
        <Route path="/materiales/:id/editar" element={<MaterialForm />} />
        <Route path="/categorias" element={<Categorias />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
