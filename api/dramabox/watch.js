import axios from 'axios'

const DRAMABOX_API = 'https://restxdb.onrender.com/api'

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    if (req.method === 'OPTIONS') return res.status(200).end()

    const { bookId, chapterIndex = '0', lang = 'th' } = req.query
    if (!bookId) return res.status(400).json({ error: 'Missing bookId' })

    try {
        const r = await axios.get(`${DRAMABOX_API}/watch/${bookId}/${chapterIndex}?lang=${lang}&source=search_result`)
        res.setHeader('Cache-Control', 'public, max-age=60')
        return res.json(r.data)
    } catch (err) {
        return res.status(err.response?.status || 500).json({ error: err.message })
    }
}
