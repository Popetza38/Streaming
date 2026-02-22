import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin, ResolvedConfig } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'

function apiProxyPlugin(): Plugin {
  let DB_API_URL = ''
  let DB_TOKEN = ''
  let SM_API_URL = ''
  let SM_TOKEN = ''

  async function handleApiRequest(req: IncomingMessage, res: ServerResponse) {
    const reqUrl = req.url || ''
    const url = new URL(reqUrl, 'http://localhost')
    const platform = url.searchParams.get('platform') || 'dramabox'
    const apiPath = url.pathname.replace(/^\/api/, '')

    url.searchParams.delete('platform')
    const qs = url.searchParams.toString()
    const queryString = qs ? `?${qs}` : ''

    let targetUrl: string
    let headers: Record<string, string>

    if (platform === 'shortmax') {
      targetUrl = `${SM_API_URL}${apiPath}${queryString}`
      headers = {
        'Authorization': `Bearer ${SM_TOKEN}`,
        'User-Agent': 'ShortMax-App/1.0',
      }
    } else {
      targetUrl = `${DB_API_URL}${apiPath}${queryString}`
      headers = {
        'Authorization': `Bearer ${DB_TOKEN}`,
      }
    }

    console.log(`[proxy] ${platform} → ${targetUrl}`)

    const resp = await fetch(targetUrl, { headers })
    const body = await resp.text()

    res.writeHead(resp.status, {
      'Content-Type': resp.headers.get('content-type') || 'application/json',
      'Access-Control-Allow-Origin': '*',
    })
    res.end(body)
  }

  async function handleVideoRequest(req: IncomingMessage, res: ServerResponse) {
    const reqUrl = req.url || ''
    const url = new URL(reqUrl, 'http://localhost')
    const videoUrl = url.searchParams.get('url')

    if (!videoUrl) {
      res.writeHead(400)
      res.end('Missing url')
      return
    }

    const fullUrl = `https://${videoUrl}`
    const resp = await fetch(fullUrl)

    if (videoUrl.includes('.m3u8')) {
      let text = await resp.text()
      const baseUrl = videoUrl.substring(0, videoUrl.lastIndexOf('/') + 1)

      text = text.replace(/^(?!#)(.+\.ts.*)$/gm, (match: string) => {
        if (match.startsWith('http')) return `/video?url=${encodeURIComponent(match.replace('https://', ''))}`
        return `/video?url=${encodeURIComponent(baseUrl + match)}`
      })
      text = text.replace(/^(?!#)(.+\.m3u8.*)$/gm, (match: string) => {
        if (match.startsWith('http')) return `/video?url=${encodeURIComponent(match.replace('https://', ''))}`
        return `/video?url=${encodeURIComponent(baseUrl + match)}`
      })

      res.writeHead(200, {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*',
      })
      res.end(text)
    } else {
      const buf = Buffer.from(await resp.arrayBuffer())
      res.writeHead(200, {
        'Content-Type': resp.headers.get('content-type') || 'video/mp2t',
        'Access-Control-Allow-Origin': '*',
      })
      res.end(buf)
    }
  }

  return {
    name: 'api-proxy',
    configResolved(config: ResolvedConfig) {
      const env = loadEnv(config.mode, config.root, '')
      const decode = (s: string) => s ? Buffer.from(s, 'base64').toString('utf-8') : ''
      DB_API_URL = decode(env.API_URL_E) || env.API_URL || ''
      DB_TOKEN = decode(env.AUTH_TOKEN_E) || env.AUTH_TOKEN || ''
      SM_API_URL = env.SM_API_URL || ''
      SM_TOKEN = env.SM_AUTH_TOKEN || ''
      console.log('[api-proxy] DB:', DB_API_URL ? '✅' : '❌', 'SM:', SM_API_URL ? '✅' : '❌')
    },
    configureServer(server) {
      // IMPORTANT: outer function must be synchronous for connect compatibility
      // next() is called synchronously for non-matching routes
      // async work runs in background for matching routes
      server.middlewares.use((
        req: IncomingMessage,
        res: ServerResponse,
        next: () => void
      ) => {
        const reqUrl = req.url || ''

        if (reqUrl.startsWith('/api/') || reqUrl.startsWith('/api?')) {
          // Handle API — don't call next(), respond ourselves
          handleApiRequest(req, res).catch((err) => {
            console.error('[api-proxy] API error:', err.message)
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: err.message }))
            }
          })
          return // Don't call next()
        }

        if (reqUrl.startsWith('/video')) {
          // Handle video — don't call next(), respond ourselves
          handleVideoRequest(req, res).catch((err) => {
            console.error('[api-proxy] Video error:', err.message)
            if (!res.headersSent) {
              res.writeHead(500)
              res.end('Video proxy error')
            }
          })
          return // Don't call next()
        }

        // Not our route
        next()
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), apiProxyPlugin()],
  resolve: { alias: { '@': '/src' } },
})
