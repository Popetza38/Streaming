const API_URL = process.env.API_URL || 'https://captain.sapimu.au/shortmax/api/v1';
const TOKEN = process.env.AUTH_TOKEN;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!TOKEN) return res.status(500).json({ error: 'AUTH_TOKEN not configured' });

  const { code, ep = '1', lang = 'en' } = req.query;
  if (!code) return res.status(400).json({ error: 'Missing code' });
  
  if (parseInt(ep) >= 30) {
    return res.status(403).json({ error: 'Episode locked' });
  }
  
  try {
    const response = await fetch(`${API_URL}/play/${code}?ep=${ep}&lang=${lang}`, {
      headers: { Authorization: `Bearer ${TOKEN}`, 'User-Agent': 'ShortMax-App/1.0' }
    });
    res.json(await response.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
