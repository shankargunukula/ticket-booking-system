import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Enforces local developer sandbox instance port allocation
    strictPort: true, // Fail instantly if port 5173 is occupied elsewhere
    proxy: {
      // Optional Proxy: Redirects frontend calls seamlessly to API Gateway
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
