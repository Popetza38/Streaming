import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import axios from 'axios'
import { createRequire } from 'module'
import type { Plugin, ResolvedConfig } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'

const require = createRequire(import.meta.url)

function apiProxyPlugin(): Plugin {
  let keyDeriver: any = null
  function getKeyDeriver() {
    if (!keyDeriver) {
      keyDeriver = require('./src/utils/keyDeriver.cjs')
    }
    return keyDeriver
  }
  let DB_API_URL = ''
  let DB_TOKEN = ''
  let SM_API_URL = ''
  let SM_TOKEN = ''
  let SB_API_URL = ''
  let SB_TOKEN = ''

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

    if (platform === 'shortbox') {
      targetUrl = `${SB_API_URL}${apiPath}${queryString}`
      headers = {
        'Authorization': `Bearer ${SB_TOKEN}`,
        'User-Agent': 'ShortBox-App/1.0',
      }
    } else if (platform === 'shortmax') {
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

  async function handleImgRequest(req: IncomingMessage, res: ServerResponse) {
    const reqUrl = req.url || ''
    const url = new URL(reqUrl, 'http://localhost')
    const imgUrl = url.searchParams.get('url')

    if (!imgUrl) {
      res.writeHead(400)
      res.end('Missing url')
      return
    }

    const resp = await fetch(imgUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    const buf = Buffer.from(await resp.arrayBuffer())

    res.writeHead(200, {
      'Content-Type': resp.headers.get('content-type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    })
    res.end(buf)
  }

  async function handleSbProxyRequest(req: IncomingMessage, res: ServerResponse) {
    const reqUrl = req.url || ''
    const url = new URL(reqUrl, 'http://localhost')
    const targetUrl = url.searchParams.get('url')
    const kid = url.searchParams.get('kid')

    if (!targetUrl) {
      res.writeHead(400)
      res.end('Missing url')
      return
    }

    try {
      console.log(`[sb-proxy] Fetching: ${targetUrl}`)
      const resp = await axios.get(targetUrl, {
        headers: {
          'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.shortbox.com/',
        },
        responseType: 'arraybuffer',
        timeout: 15000,
        validateStatus: () => true, // Handle all statuses manually
      })

      if (resp.status >= 400) {
        console.error(`[sb-proxy] Upstream error: ${resp.status} ${resp.statusText}`)
        res.writeHead(resp.status)
        res.end(`Upstream error: ${resp.statusText}`)
        return
      }

      const ct = resp.headers['content-type'] || 'application/octet-stream'

      // Handle m3u8 playlists
      if (ct.includes('mpegurl') || targetUrl.split('?')[0].endsWith('.m3u8')) {
        let text = Buffer.from(resp.data).toString('utf-8')
        const base = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1)

        // Remove EXT-X-KEY line (decrypt server-side or handle in player)
        text = text.replace(/^#EXT-X-KEY:.*$/gm, '')

        // Rewrite paths
        const rewrite = (line: string) => {
          const full = line.startsWith('http') ? line : base + line
          let proxyUrl = '/sb-proxy?url=' + encodeURIComponent(full)
          if (kid) proxyUrl += '&kid=' + encodeURIComponent(kid)
          return proxyUrl
        }

        text = text.replace(/^(?!#)(.+\.ts.*)$/gm, rewrite)
        text = text.replace(/^(?!#)(.+\.m3u8.*)$/gm, rewrite)

        res.writeHead(200, {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*',
        })
        res.end(text)
      } else {
        let buf = Buffer.from(resp.data)

        // If kid is provided, check if we need to decrypt
        if (kid && buf.length > 0 && buf[0] !== 0x47) {
          try {
            const { decryptSegment, keyCache } = getKeyDeriver()
            const keyStr = keyCache.get(kid)
            if (keyStr) {
              console.log(`[sb-proxy] Decrypting segment with kid: ${kid}`)
              buf = decryptSegment(buf, keyStr)
            } else {
              console.warn(`[sb-proxy] No key found for kid: ${kid}, passing through`)
            }
          } catch (err: any) {
            console.error(`[sb-proxy] Decryption failed: ${err.message}`)
          }
        }

        res.writeHead(200, {
          'Content-Type': ct,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600',
        })
        res.end(buf)
      }
    } catch (err: any) {
      console.error(`[sb-proxy] Proxy error: ${err.message}`)
      if (!res.headersSent) {
        res.writeHead(502)
        res.end(`Proxy error: ${err.message}`)
      }
    }
  }

  async function handleDeriveKey(req: IncomingMessage, res: ServerResponse) {
    // In dev mode, we skip actual DRM key derivation since it requires heavy SDK
    // Just return success — the sb-proxy will pass through without decryption
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    })
    res.end(JSON.stringify({ status: 'ok', message: 'Dev mode - key derivation skipped' }))
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
      SB_API_URL = env.SB_API_URL || ''
      SB_TOKEN = env.SB_API_TOKEN || ''
      console.log('[api-proxy] DB:', DB_API_URL ? '✅' : '❌', 'SM:', SM_API_URL ? '✅' : '❌', 'SB:', SB_API_URL ? '✅' : '❌')
    },
    configureServer(server) {
      server.middlewares.use((
        req: IncomingMessage,
        res: ServerResponse,
        next: () => void
      ) => {
        const reqUrl = req.url || ''

        if (reqUrl.startsWith('/api/') || reqUrl.startsWith('/api?')) {
          handleApiRequest(req, res).catch((err) => {
            console.error('[api-proxy] API error:', err.message)
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: err.message }))
            }
          })
          return
        }

        if (reqUrl.startsWith('/video')) {
          handleVideoRequest(req, res).catch((err) => {
            console.error('[api-proxy] Video error:', err.message)
            if (!res.headersSent) {
              res.writeHead(500)
              res.end('Video proxy error')
            }
          })
          return
        }

        if (reqUrl.startsWith('/img')) {
          handleImgRequest(req, res).catch((err) => {
            console.error('[api-proxy] Img error:', err.message)
            if (!res.headersSent) {
              res.writeHead(502)
              res.end('Image fetch failed')
            }
          })
          return
        }

        if (reqUrl.startsWith('/sb-proxy')) {
          handleSbProxyRequest(req, res).catch((err) => {
            console.error('[api-proxy] SB-Proxy error:', err)
            if (!res.headersSent) {
              res.writeHead(502)
              res.end('SB proxy error')
            }
          })
          return
        }

        if (reqUrl.startsWith('/derive-key')) {
          const url = new URL(reqUrl, 'http://localhost')
          const playAuth = url.searchParams.get('playAuth')
          const kid = url.searchParams.get('kid')

          if (!playAuth || !kid) {
            res.writeHead(400)
            res.end('Missing playAuth or kid')
            return
          }

          const { deriveKey } = getKeyDeriver()
          deriveKey(playAuth, kid)
            .then(() => {
              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              })
              res.end(JSON.stringify({ status: 'ok', kid }))
            })
            .catch((err: any) => {
              console.error('[derive-key] Error:', err.message)
              res.writeHead(500)
              res.end(JSON.stringify({ error: err.message }))
            })
          return
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
