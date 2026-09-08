import { Outlet } from 'react-router-dom';
import Header from './components/Header';

export default function App() {
  return (
    <div className="min-h-screen bg-canvas">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
