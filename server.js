import express from 'express'
import axios from 'axios'
import { config } from 'dotenv'

config()

const app = express()

// ===== DramaBox credentials =====
const _d = (s) => Buffer.from(s, 'base64').toString('utf-8')
const DB_API_URL = _d(process.env.API_URL_E || '') || process.env.API_URL || ''
const DB_TOKEN = _d(process.env.AUTH_TOKEN_E || '') || process.env.AUTH_TOKEN || ''

// ===== ShortMax credentials =====
const SM_API_URL = process.env.SM_API_URL || 'https://captain.sapimu.au/shortmax/api/v1'
const SM_TOKEN = process.env.SM_AUTH_TOKEN || ''

// ===== ShortBox credentials =====
const SB_API_URL = process.env.SB_API_URL || 'https://captain.sapimu.au/shortbox/api'
const SB_TOKEN = process.env.SB_API_TOKEN || ''

const DB_ALLOWED_PATHS = ['/foryou/', '/new/', '/rank/', '/search/', '/suggest/', '/classify', '/chapters/', '/watch/']
const SM_ALLOWED_PATHS = ['/foryou', '/detail/', '/play/', '/search', '/feed/', '/home']
const SB_ALLOWED_PATHS = ['/list', '/new-list', '/hot-search', '/detail/', '/episodes/', '/search']

// Lazy load keyDeriver only when needed
let deriveKey, decryptSegment, keyCache
let keyDeriverLoaded = false
const loadKeyDeriver = async () => {
  if (!keyDeriverLoaded) {
    try {
      const module = await import('./src/utils/keyDeriver.js')
      deriveKey = module.deriveKey
      decryptSegment = module.decryptSegment
      keyCache = module.keyCache
      keyDeriverLoaded = true
      console.log('[KeyDeriver] Loaded successfully')
    } catch (error) {
      console.error('[KeyDeriver] Load failed:', error.message)
      return {
        deriveKey: async () => { throw new Error('KeyDeriver not available') },
        decryptSegment: () => { throw new Error('KeyDeriver not available') },
        keyCache: new Map(),
      }
    }
  }
  return { deriveKey, decryptSegment, keyCache }
}

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

// ===== Image Proxy (for ShortBox cover images) =====
app.get('/img', async (req, res) => {
  const url = req.query.url
  if (!url) return res.status(400).send('Missing url')
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    const contentType = response.headers['content-type'] || 'image/jpeg'
    res.set('Content-Type', contentType)
    res.set('Cache-Control', 'public, max-age=86400')
    res.set('Access-Control-Allow-Origin', '*')
    res.send(Buffer.from(response.data))
  } catch (error) {
    res.status(502).send('Image fetch failed')
  }
})

// ===== Derive DRM Key (for ShortBox) =====
app.get('/derive-key', async (req, res) => {
  const { playAuth, kid } = req.query
  if (!playAuth || !kid) return res.status(400).json({ error: 'Missing playAuth or kid' })
  try {
    const { deriveKey } = await loadKeyDeriver()
    const keyStr = await deriveKey(playAuth, kid)
    res.json({ kid, keyLength: keyStr.length, cached: true })
  } catch (e) {
    console.error('[Derive Key Error]', e.message)
    res.status(500).json({ error: e.message })
  }
})

// ===== ShortBox HLS Proxy with DRM decryption =====
app.get('/sb-proxy', async (req, res) => {
  const url = req.query.url
  const kid = req.query.kid
  if (!url) return res.status(400).send('Missing url')
  try {
    const r = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })
    const ct = r.headers['content-type'] || 'application/octet-stream'
    res.set('Content-Type', ct)
    res.set('Access-Control-Allow-Origin', '*')

    // Handle m3u8 playlists: remove EXT-X-KEY, rewrite URLs
    if (ct.includes('mpegurl') || url.endsWith('.m3u8')) {
      let text = Buffer.from(r.data).toString('utf-8')
      const base = url.substring(0, url.lastIndexOf('/') + 1)

      // Remove EXT-X-KEY line (we decrypt server-side)
      text = text.replace(/^#EXT-X-KEY:.*$/gm, '')

      // Rewrite .ts segments through proxy with kid for decryption
      text = text.replace(/^(?!#)(.+\.ts.*)$/gm, (line) => {
        const full = line.startsWith('http') ? line : base + line
        let proxyUrl = '/sb-proxy?url=' + encodeURIComponent(full)
        if (kid) proxyUrl += '&kid=' + encodeURIComponent(kid)
        return proxyUrl
      })
      // Rewrite sub-m3u8 URLs
      text = text.replace(/^(?!#)(.+\.m3u8.*)$/gm, (line) => {
        const full = line.startsWith('http') ? line : base + line
        let proxyUrl = '/sb-proxy?url=' + encodeURIComponent(full)
        if (kid) proxyUrl += '&kid=' + encodeURIComponent(kid)
        return proxyUrl
      })
      res.set('Content-Type', 'application/vnd.apple.mpegurl')
      return res.send(text)
    }

    // Handle TS segments: decrypt if key is cached
    if (url.includes('.ts') && kid) {
      const { keyCache, decryptSegment } = await loadKeyDeriver()
      if (keyCache.has(kid)) {
        const buffer = Buffer.from(r.data)
        if (buffer[0] !== 0x47) {
          try {
            const decrypted = decryptSegment(buffer, keyCache.get(kid))
            res.set('Content-Type', 'video/mp2t')
            return res.send(decrypted)
          } catch {
            // Decryption failed, serve as-is
          }
        }
        res.set('Content-Type', 'video/mp2t')
        return res.send(buffer)
      }
    }

    res.send(Buffer.from(r.data))
  } catch (e) {
    res.status(502).send(e.message)
  }
})

// ===== Video Proxy (for ShortMax HLS streams) =====
app.get('/video', async (req, res) => {
  const videoUrl = req.query.url
  if (!videoUrl) return res.status(400).send('Missing url')

  const fullUrl = `https://${videoUrl}`

  try {
    if (videoUrl.includes('.m3u8')) {
      const response = await axios.get(fullUrl)
      let text = response.data
      const baseUrl = videoUrl.substring(0, videoUrl.lastIndexOf('/') + 1)

      // Rewrite .ts segments
      text = text.replace(/^(?!#)(.+\.ts.*)$/gm, (match) => {
        if (match.startsWith('http')) {
          return `/video?url=${encodeURIComponent(match.replace('https://', ''))}`
        }
        return `/video?url=${encodeURIComponent(baseUrl + match)}`
      })

      // Rewrite sub-manifests
      text = text.replace(/^(?!#)(.+\.m3u8.*)$/gm, (match) => {
        if (match.startsWith('http')) {
          return `/video?url=${encodeURIComponent(match.replace('https://', ''))}`
        }
        return `/video?url=${encodeURIComponent(baseUrl + match)}`
      })

      res.set('Content-Type', 'application/vnd.apple.mpegurl')
      res.set('Access-Control-Allow-Origin', '*')
      res.set('Cache-Control', 'public, max-age=300')
      return res.send(text)
    }

    const response = await axios.get(fullUrl, { responseType: 'stream' })
    res.set('Content-Type', response.headers['content-type'])
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Cache-Control', 'public, max-age=3600')
    response.data.pipe(res)
  } catch (err) {
    res.status(500).send('Video proxy error')
  }
})

// ===== Download Endpoint (for HLS → downloadable file) =====
app.get('/download', async (req, res) => {
  const videoUrl = req.query.url
  const filename = req.query.name || 'video.mp4'
  if (!videoUrl) return res.status(400).send('Missing url')

  const fullUrl = `https://${videoUrl}`

  try {
    if (videoUrl.includes('.m3u8')) {
      // Fetch the m3u8 manifest
      const manifestRes = await axios.get(fullUrl)
      let manifestText = manifestRes.data

      // If this is a master playlist, pick the highest quality variant
      if (manifestText.includes('#EXT-X-STREAM-INF')) {
        const lines = manifestText.split('\n')
        let bestUrl = ''
        let bestBandwidth = 0
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim()
          if (line.startsWith('#EXT-X-STREAM-INF')) {
            const bwMatch = line.match(/BANDWIDTH=(\d+)/)
            const bw = bwMatch ? parseInt(bwMatch[1]) : 0
            const nextLine = lines[i + 1]?.trim()
            if (nextLine && !nextLine.startsWith('#') && bw > bestBandwidth) {
              bestBandwidth = bw
              bestUrl = nextLine
            }
          }
        }
        if (bestUrl) {
          const baseUrl = videoUrl.substring(0, videoUrl.lastIndexOf('/') + 1)
          const variantUrl = bestUrl.startsWith('http')
            ? bestUrl
            : `https://${baseUrl}${bestUrl}`
          const variantRes = await axios.get(variantUrl)
          manifestText = variantRes.data
        }
      }

      // Parse segment URLs from the media playlist
      const lines = manifestText.split('\n')
      const baseUrl = videoUrl.substring(0, videoUrl.lastIndexOf('/') + 1)
      const segments = []
      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed && !trimmed.startsWith('#')) {
          if (trimmed.startsWith('http')) {
            segments.push(trimmed)
          } else {
            segments.push(`https://${baseUrl}${trimmed}`)
          }
        }
      }

      if (segments.length === 0) {
        return res.status(400).send('No segments found in manifest')
      }

      // Stream segments as downloadable file
      res.set('Content-Type', 'video/mp2t')
      res.set('Content-Disposition', `attachment; filename="${filename}"`)
      res.set('Access-Control-Allow-Origin', '*')

      for (const segUrl of segments) {
        try {
          const segRes = await axios.get(segUrl, { responseType: 'arraybuffer' })
          res.write(Buffer.from(segRes.data))
        } catch {
          // Skip failed segments
        }
      }
      res.end()
    } else {
      // Direct file download proxy
      const response = await axios.get(fullUrl, { responseType: 'stream' })
      res.set('Content-Type', response.headers['content-type'] || 'video/mp4')
      res.set('Content-Disposition', `attachment; filename="${filename}"`)
      res.set('Access-Control-Allow-Origin', '*')
      response.data.pipe(res)
    }
  } catch (err) {
    res.status(500).send('Download error')
  }
})

// ===== Unified API Proxy =====
app.use('/api', async (req, res) => {
  const platform = req.query.platform || 'dramabox'
  const path = req.path

  // Remove platform from forwarded query params
  const params = { ...req.query }
  delete params.platform

  if (platform === 'shortbox') {
    // ShortBox routing
    if (!SB_ALLOWED_PATHS.some(p => path.startsWith(p))) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    try {
      const response = await axios.get(`${SB_API_URL}${path}`, {
        params,
        headers: {
          Authorization: `Bearer ${SB_TOKEN}`,
          'User-Agent': 'ShortBox-App/1.0'
        },
        timeout: 30000,
      })

      res.set('Cache-Control', 'public, max-age=300')
      res.json(response.data)
    } catch (err) {
      res.status(err.response?.status || 500).json({ error: err.message })
    }
  } else if (platform === 'shortmax') {
    // ShortMax routing
    if (!SM_ALLOWED_PATHS.some(p => path.startsWith(p))) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    try {
      const response = await axios.get(`${SM_API_URL}${path}`, {
        params,
        headers: {
          Authorization: `Bearer ${SM_TOKEN}`,
          'User-Agent': 'ShortMax-App/1.0'
        }
      })

      res.set('Cache-Control', 'public, max-age=300')
      res.json(response.data)
    } catch (err) {
      res.status(err.response?.status || 500).json({ error: err.message })
    }
  } else {
    // DramaBox routing (default)
    if (!DB_ALLOWED_PATHS.some(p => path.startsWith(p))) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    try {
      const response = await axios.get(`${DB_API_URL}${path}`, {
        params,
        headers: { Authorization: `Bearer ${DB_TOKEN}` }
      })

      res.json(response.data)
    } catch (err) {
      res.status(err.response?.status || 500).json({
        error: 'API request failed'
      })
    }
  }
})

app.use(express.static('dist'))
app.get('/{*path}', (req, res) => res.sendFile('index.html', { root: 'dist' }))

app.listen(3000, () => console.log('Server running on port 3000'))
