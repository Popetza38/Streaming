import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Decode base64 encoded credentials, fallback to plain values
  const decode = (s: string) => s ? Buffer.from(s, 'base64').toString('utf-8') : ''
  const API_URL = decode(env.API_URL_E) || env.API_URL || ''
  const AUTH_TOKEN = decode(env.AUTH_TOKEN_E) || env.AUTH_TOKEN || ''

  return {
    plugins: [react()],
    resolve: { alias: { '@': '/src' } },
    server: {
      proxy: {
        '/api': {
          target: API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (AUTH_TOKEN) {
                proxyReq.setHeader('Authorization', `Bearer ${AUTH_TOKEN}`)
              }
            })
          }
        }
      }
    }
  }
})
