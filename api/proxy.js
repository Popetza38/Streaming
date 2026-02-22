import axios from 'axios'

const API_URL = process.env.API_URL || 'https://captain.sapimu.au/shortmax/api/v1'
const TOKEN = process.env.AUTH_TOKEN
const headers = { Authorization: `Bearer ${TOKEN}`, 'User-Agent': 'ShortMax-App/1.0' }
const DRAMABOX_API = 'https://restxdb.onrender.com/api'

function cors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default async function handler(req, res) {
    cors(res)
    if (req.method === 'OPTIONS') return res.status(200).end()

    const { pathname } = new URL(req.url, `https://${req.headers.host}`)
    const q = req.query

    try {
        // ===== ShortMax =====
        if (pathname === '/api/foryou') {
            const r = await axios.get(`${API_URL}/foryou`, { params: { page: q.page || '1', lang: q.lang || 'th' }, headers })
            res.setHeader('Cache-Control', 'public, max-age=300')
            return res.json(r.data)
        }

        if (pathname === '/api/detail') {
            if (!q.code) return res.status(400).json({ error: 'Missing code' })
            const r = await axios.get(`${API_URL}/detail/${q.code}`, { params: { lang: q.lang || 'th' }, headers })
            res.setHeader('Cache-Control', 'public, max-age=60')
            return res.json(r.data)
        }

        if (pathname === '/api/play') {
            if (!q.code) return res.status(400).json({ error: 'Missing code' })
            const ep = q.ep || '1'
            if (parseInt(ep) >= 30) {
                return res.status(403).json({ success: false, error: 'Episode locked', message: 'For full API access, check Telegram @sapitokenbot' })
            }
            const r = await axios.get(`${API_URL}/play/${q.code}`, { params: { ep, lang: q.lang || 'th' }, headers })
            res.setHeader('Cache-Control', 'public, max-age=60')
            return res.json(r.data)
        }

        if (pathname === '/api/search') {
            if (!q.q) return res.status(400).json({ error: 'Missing query' })
            const r = await axios.get(`${API_URL}/search`, { params: { q: q.q, lang: q.lang || 'th', page: q.page || '1' }, headers })
            res.setHeader('Cache-Control', 'public, max-age=300')
            return res.json(r.data)
        }

        if (pathname === '/api/feed') {
            const r = await axios.get(`${API_URL}/feed/${q.type || 'vip'}`, { params: { lang: q.lang || 'th' }, headers })
            res.setHeader('Cache-Control', 'public, max-age=300')
            return res.json(r.data)
        }

        if (pathname === '/api/home') {
            const r = await axios.get(`${API_URL}/home`, { params: { tab: q.tab || '1', lang: q.lang || 'th' }, headers })
            res.setHeader('Cache-Control', 'public, max-age=300')
            return res.json(r.data)
        }

        // ===== DramaBox =====
        if (pathname === '/api/dramabox/foryou') {
            const r = await axios.get(`${DRAMABOX_API}/foryou/${q.page || '1'}?lang=${q.lang || 'th'}`)
            res.setHeader('Cache-Control', 'public, max-age=300')
            return res.json(r.data)
        }

        if (pathname === '/api/dramabox/new') {
            const r = await axios.get(`${DRAMABOX_API}/new/${q.page || '1'}?lang=${q.lang || 'th'}&pageSize=${q.pageSize || '10'}`)
            res.setHeader('Cache-Control', 'public, max-age=300')
            return res.json(r.data)
        }

        if (pathname === '/api/dramabox/rank') {
            const r = await axios.get(`${DRAMABOX_API}/rank/${q.page || '1'}?lang=${q.lang || 'th'}`)
            res.setHeader('Cache-Control', 'public, max-age=300')
            return res.json(r.data)
        }

        if (pathname === '/api/dramabox/search') {
            if (!q.q) return res.status(400).json({ error: 'Missing query' })
            const r = await axios.get(`${DRAMABOX_API}/search/${encodeURIComponent(q.q)}/${q.page || '1'}?lang=${q.lang || 'th'}`)
            res.setHeader('Cache-Control', 'public, max-age=300')
            return res.json(r.data)
        }

        if (pathname === '/api/dramabox/chapters') {
            if (!q.bookId) return res.status(400).json({ error: 'Missing bookId' })
            const r = await axios.get(`${DRAMABOX_API}/chapters/${q.bookId}?lang=${q.lang || 'th'}`)
            res.setHeader('Cache-Control', 'public, max-age=60')
            return res.json(r.data)
        }

        if (pathname === '/api/dramabox/watch') {
            if (!q.bookId) return res.status(400).json({ error: 'Missing bookId' })
            const r = await axios.get(`${DRAMABOX_API}/watch/${q.bookId}/${q.chapterIndex || '0'}?lang=${q.lang || 'th'}&source=search_result`)
            res.setHeader('Cache-Control', 'public, max-age=60')
            return res.json(r.data)
        }

        return res.status(404).json({ error: 'Not found' })
    } catch (err) {
        return res.status(err.response?.status || 500).json({ error: err.message })
    }
}
