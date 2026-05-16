import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'node:path'

/** In dev, Vite has no Express `/api` — stub config so Stripe loader’s fetch doesn’t 404. */
function massarDevApiStub() {
  return {
    name: 'massar-dev-api-stub',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0]
        if (url === '/api/config' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-store')
          res.end(JSON.stringify({ stripePublishableKey: '' }))
          return
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), massarDevApiStub()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    open: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
    },
  },
});
