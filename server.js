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

const DB_ALLOWED_PATHS = ['/foryou/', '/new/', '/rank/', '/search/', '/suggest/', '/classify', '/chapters/', '/watch/']
const SM_ALLOWED_PATHS = ['/foryou', '/detail/', '/play/', '/search', '/feed/', '/home']

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
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

// ===== Unified API Proxy =====
app.use('/api', async (req, res) => {
  const platform = req.query.platform || 'dramabox'
  const path = req.path

  // Remove platform from forwarded query params
  const params = { ...req.query }
  delete params.platform

  if (platform === 'shortmax') {
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
