import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy /api requests to the local Flask backend during development.
    // The browser only ever sees requests to localhost:5173, so no CORS
    // headers are needed. In production, Vercel's rewrite rule forwards
    // /api/* to the backend service on the same domain (same-origin).
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
})


