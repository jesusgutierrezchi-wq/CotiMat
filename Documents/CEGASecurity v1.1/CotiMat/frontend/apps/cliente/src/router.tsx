import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Catalogo from './pages/Catalogo';
import Cotizacion from './pages/Cotizacion';
import CotizacionDetalle from './pages/CotizacionDetalle';
import Historial from './pages/Historial';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Catalogo /> },
      { path: 'cotizacion', element: <Cotizacion /> },
      { path: 'cotizacion/:folio', element: <CotizacionDetalle /> },
      { path: 'historial', element: <Historial /> },
    ],
  },
]);
