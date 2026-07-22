import express from 'express'
import axios from 'axios'
import { config } from 'dotenv'

config()

const app = express()
app.use(express.json())

const API_URL = process.env.API_URL || 'https://api.hoshiyomi.my.id'
const PRIMARY_KEY = process.env.HOSHIYOMI_API_KEY || 'HOSHIYOMI-FREE-e96e9f3f'
const API_KEYS = Array.from(new Set([PRIMARY_KEY, 'HOSHIYOMI-FREE-e96e9f3f', 'HOSHIYOMI-TRIAL']))

// Response Cache to reduce API rate limits
const cache = new Map()
const CACHE_TTL = 3 * 60 * 1000 // 3 minutes TTL

function getCache(key) {
  const item = cache.get(key)
  if (!item) return null
  if (Date.now() - item.time > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  return item.data
}

function setCache(key, data) {
  cache.set(key, { data, time: Date.now() })
}

async function fetchWithKeyFailover(fullUrl, params) {
  let lastError
  for (const apiKey of API_KEYS) {
    try {
      const response = await axios.get(fullUrl, {
        params,
        headers: { 
          'X-API-Key': apiKey,
          'User-Agent': 'Streaming-Hoshiyomi/1.0'
        },
        transformResponse: [(data) => data]
      })
      return response
    } catch (err) {
      lastError = err
      if (err.response?.status === 429 || err.response?.status === 401) {
        console.warn(`[Proxy Failover] Key ${apiKey} returned ${err.response?.status}, switching to backup key...`)
        continue
      }
      throw err
    }
  }
  throw lastError
}

function rewriteM3U8(m3u8Text, baseUrl) {
  const lines = m3u8Text.split('\n')
  const rewritten = lines.map(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      return line
    }

    let absoluteUrl = trimmed
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      try {
        absoluteUrl = new URL(trimmed, baseUrl).toString()
      } catch (e) {
        return line
      }
    }

    return `/api/stream-proxy?url=${encodeURIComponent(absoluteUrl)}`
  })

  return rewritten.join('\n')
}

// Stream Proxy endpoint to bypass CORS policy for segment files
app.get('/api/stream-proxy', async (req, res) => {
  const targetUrl = req.query.url
  if (!targetUrl) return res.status(400).send('Missing url parameter')

  try {
    const response = await axios.get(targetUrl, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.goodreels.com/'
      }
    })

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Content-Type', response.headers['content-type'] || 'video/mp2t')
    
    response.data.pipe(res)
  } catch (err) {
    console.error('Stream proxy error:', err.message)
    res.status(500).send('Stream Proxy Failed')
  }
})

app.use('/api', async (req, res) => {
  const path = req.path
  let targetPath = path
  const params = { ...req.query }

  // Legacy route shortcuts default to dramabox
  if (path === '/home' || path === '/rank') {
    targetPath = '/dramabox/trending'
  } else if (path === '/foryou') {
    targetPath = '/dramabox/foryou'
  } else if (path === '/new') {
    targetPath = '/dramabox/latest'
  } else if (path === '/search') {
    targetPath = '/dramabox/search'
    if (params.keyword && !params.q) {
      params.q = params.keyword
    }
  } else if (path.startsWith('/drama/')) {
    const parts = path.split('/')
    const id = parts[2]
    if (parts[3] === 'episodes') {
      targetPath = '/dramabox/allepisode'
      params.id = id
    } else {
      targetPath = '/dramabox/detail'
      params.id = id
    }
  }

  const cacheKey = targetPath + '?' + new URLSearchParams(params).toString()
  const cachedData = getCache(cacheKey)
  if (cachedData) {
    if (typeof cachedData === 'string' && cachedData.includes('#EXTM3U')) {
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
      return res.send(cachedData)
    }
    return res.json(cachedData)
  }

  try {
    const fullUrl = `${API_URL}/api${targetPath}`
    const response = await fetchWithKeyFailover(fullUrl, params)
    
    let rawData = response.data
    if (typeof rawData === 'string') {
      let trimmed = rawData.trim()
      if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        try {
          rawData = JSON.parse(trimmed)
        } catch (e) {
          // ignore
        }
      }
    }

    if (typeof rawData === 'string') {
      let cleanText = rawData.trim()
      if (cleanText.includes('#EXTM3U')) {
        const baseUrl = `${API_URL}/api${targetPath}`
        const rewrittenText = rewriteM3U8(cleanText, baseUrl)
        setCache(cacheKey, rewrittenText)
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
        return res.send(rewrittenText)
      }

      try {
        const jsonData = JSON.parse(cleanText)
        setCache(cacheKey, jsonData)
        return res.json(jsonData)
      } catch (e) {
        setCache(cacheKey, cleanText)
        return res.send(cleanText)
      }
    }

    setCache(cacheKey, rawData)
    return res.json(rawData)

  } catch (err) {
    return res.status(err.response?.status || 500).json({ 
      error: err.response?.data?.error || err.message || 'API request failed' 
    })
  }
})

app.use(express.static('dist'))
app.use((req, res) => {
  res.sendFile('index.html', { root: 'dist' })
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
  console.log(`Active Primary Hoshiyomi API Key: ${PRIMARY_KEY}`)
})
