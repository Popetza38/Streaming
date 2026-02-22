import express from 'express'
import axios from 'axios'
import { config } from 'dotenv'

config()

const app = express()

// Decode obfuscated credentials
const _d = (s) => Buffer.from(s, 'base64').toString('utf-8')
const API_URL = _d(process.env.API_URL_E || '') || process.env.API_URL || ''
const TOKEN = _d(process.env.AUTH_TOKEN_E || '') || process.env.AUTH_TOKEN || ''

const ALLOWED_PATHS = ['/foryou/', '/new/', '/rank/', '/search/', '/suggest/', '/classify', '/chapters/', '/watch/']

app.use('/api', async (req, res) => {
  const path = req.path

  if (!ALLOWED_PATHS.some(p => path.startsWith(p))) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  try {
    const response = await axios.get(`${API_URL}${path}`, {
      params: req.query,
      headers: { Authorization: `Bearer ${TOKEN}` }
    })

    res.json(response.data)
  } catch (err) {
    res.status(err.response?.status || 500).json({
      error: 'API request failed'
    })
  }
})

app.use(express.static('dist'))
app.get('/{*path}', (req, res) => res.sendFile('index.html', { root: 'dist' }))

app.listen(3000, () => console.log('Server running on port 3000'))
