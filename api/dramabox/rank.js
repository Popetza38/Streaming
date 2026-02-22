import axios from 'axios'

const DRAMABOX_API = 'https://restxdb.onrender.com/api'

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    if (req.method === 'OPTIONS') return res.status(200).end()

    const { page = '1', lang = 'th' } = req.query
    try {
        const r = await axios.get(`${DRAMABOX_API}/rank/${page}?lang=${lang}`)
        res.setHeader('Cache-Control', 'public, max-age=300')
        return res.json(r.data)
    } catch (err) {
        return res.status(err.response?.status || 500).json({ error: err.message })
    }
}
