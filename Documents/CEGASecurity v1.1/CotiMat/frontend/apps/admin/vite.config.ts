import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    // Docker Desktop (Windows/Mac) no propaga eventos nativos de fs al bind mount:
    // sin polling, Vite nunca detecta cambios de archivo dentro del contenedor.
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
});
