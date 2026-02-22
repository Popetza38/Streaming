import axios from 'axios'

const API_URL = process.env.API_URL || 'https://captain.sapimu.au/shortmax/api/v1'
const TOKEN = process.env.AUTH_TOKEN
const headers = { Authorization: `Bearer ${TOKEN}`, 'User-Agent': 'ShortMax-App/1.0' }

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    if (req.method === 'OPTIONS') return res.status(200).end()

    const { tab = '1', lang = 'th' } = req.query
    try {
        const r = await axios.get(`${API_URL}/home`, { params: { tab, lang }, headers })
        res.setHeader('Cache-Control', 'public, max-age=300')
        return res.json(r.data)
    } catch (err) {
        return res.status(err.response?.status || 500).json({ error: err.message })
    }
}
