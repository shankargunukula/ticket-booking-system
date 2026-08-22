import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // Prevents Vite from slipping onto another port if 5173 blips
    proxy: {
      '^/api/.*': {
        target: 'http://127.0.0.1:8080', // Using explicit IPv4 prevents loopback address conversion errors
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
