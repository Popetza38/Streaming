import express from 'express'
import axios from 'axios'
import { config } from 'dotenv'

config()

const app = express()

const API_URL = process.env.API_URL || 'https://captain.sapimu.au/shortmax/api/v1'
const TOKEN = process.env.AUTH_TOKEN
const headers = { Authorization: `Bearer ${TOKEN}`, 'User-Agent': 'ShortMax-App/1.0' }

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

// For You
app.get('/api/foryou', async (req, res) => {
  const { lang = 'th', page = '1' } = req.query
  try {
    const response = await axios.get(`${API_URL}/foryou`, {
      params: { page, lang },
      headers
    })
    res.set('Cache-Control', 'public, max-age=300')
    res.json(response.data)
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message })
  }
})

// Detail
app.get('/api/detail', async (req, res) => {
  const { code, lang = 'th' } = req.query
  if (!code) return res.status(400).json({ error: 'Missing code' })
  try {
    const response = await axios.get(`${API_URL}/detail/${code}`, {
      params: { lang },
      headers
    })
    res.set('Cache-Control', 'public, max-age=60')
    res.json(response.data)
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message })
  }
})

// Play
app.get('/api/play', async (req, res) => {
  const { code, ep = '1', lang = 'th' } = req.query
  if (!code) return res.status(400).json({ error: 'Missing code' })

  if (parseInt(ep) >= 30) {
    return res.status(403).json({
      success: false,
      error: 'Episode locked',
      message: 'For full API access, check Telegram @sapitokenbot'
    })
  }

  try {
    const response = await axios.get(`${API_URL}/play/${code}`, {
      params: { ep, lang },
      headers
    })
    res.set('Cache-Control', 'public, max-age=60')
    res.json(response.data)
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message })
  }
})

// Search
app.get('/api/search', async (req, res) => {
  const { q, lang = 'th', page = '1' } = req.query
  if (!q) return res.status(400).json({ error: 'Missing query' })
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: { q, lang, page },
      headers
    })
    res.set('Cache-Control', 'public, max-age=300')
    res.json(response.data)
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message })
  }
})

// Feed (ranked, vip, romance, etc.)
app.get('/api/feed', async (req, res) => {
  const { type = 'vip', lang = 'th' } = req.query
  try {
    const response = await axios.get(`${API_URL}/feed/${type}`, {
      params: { lang },
      headers
    })
    res.set('Cache-Control', 'public, max-age=300')
    res.json(response.data)
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message })
  }
})

// Home
app.get('/api/home', async (req, res) => {
  const { tab = '1', lang = 'th' } = req.query
  try {
    const response = await axios.get(`${API_URL}/home`, {
      params: { tab, lang },
      headers
    })
    res.set('Cache-Control', 'public, max-age=300')
    res.json(response.data)
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message })
  }
})

// ============ DramaBox API Proxy ============
const DRAMABOX_API = 'https://restxdb.onrender.com/api'

// DramaBox - For You
app.get('/api/dramabox/foryou', async (req, res) => {
  const { page = '1', lang = 'th' } = req.query
  try {
    const response = await axios.get(`${DRAMABOX_API}/foryou/${page}?lang=${lang}`)
    res.set('Cache-Control', 'public, max-age=300')
    res.json(response.data)
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message })
  }
})

// DramaBox - New Releases
app.get('/api/dramabox/new', async (req, res) => {
  const { page = '1', lang = 'th', pageSize = '10' } = req.query
  try {
    const response = await axios.get(`${DRAMABOX_API}/new/${page}?lang=${lang}&pageSize=${pageSize}`)
    res.set('Cache-Control', 'public, max-age=300')
    res.json(response.data)
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message })
  }
})

// DramaBox - Rank
app.get('/api/dramabox/rank', async (req, res) => {
  const { page = '1', lang = 'th' } = req.query
  try {
    const response = await axios.get(`${DRAMABOX_API}/rank/${page}?lang=${lang}`)
    res.set('Cache-Control', 'public, max-age=300')
    res.json(response.data)
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message })
  }
})

// DramaBox - Search
app.get('/api/dramabox/search', async (req, res) => {
  const { q, page = '1', lang = 'th' } = req.query
  if (!q) return res.status(400).json({ error: 'Missing query' })
  try {
    const response = await axios.get(`${DRAMABOX_API}/search/${encodeURIComponent(q)}/${page}?lang=${lang}`)
    res.set('Cache-Control', 'public, max-age=300')
    res.json(response.data)
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message })
  }
})

// DramaBox - Chapters (detail)
app.get('/api/dramabox/chapters', async (req, res) => {
  const { bookId, lang = 'th' } = req.query
  if (!bookId) return res.status(400).json({ error: 'Missing bookId' })
  try {
    const response = await axios.get(`${DRAMABOX_API}/chapters/${bookId}?lang=${lang}`)
    res.set('Cache-Control', 'public, max-age=60')
    res.json(response.data)
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message })
  }
})

// DramaBox - Watch (stream video)
app.get('/api/dramabox/watch', async (req, res) => {
  const { bookId, chapterIndex = '0', lang = 'th' } = req.query
  if (!bookId) return res.status(400).json({ error: 'Missing bookId' })
  try {
    const response = await axios.get(`${DRAMABOX_API}/watch/${bookId}/${chapterIndex}?lang=${lang}&source=search_result`)
    res.set('Cache-Control', 'public, max-age=60')
    res.json(response.data)
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message })
  }
})

// Video proxy
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

app.use(express.static('dist'))
app.get('/{*path}', (req, res) => res.sendFile('index.html', { root: 'dist' }))

app.listen(3001, () => console.log('StreamBox server running on port 3001'))
