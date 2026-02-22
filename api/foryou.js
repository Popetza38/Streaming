const API_URL = process.env.API_URL || 'https://captain.sapimu.au/shortmax/api/v1';
const TOKEN = process.env.AUTH_TOKEN;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!TOKEN) return res.status(500).json({ error: 'AUTH_TOKEN not configured', hasToken: !!TOKEN });

  const { lang = 'en', page = '1' } = req.query;
  
  try {
    const url = `${API_URL}/foryou?page=${page}&lang=${lang}`;
    const response = await fetch(url, {
      headers: { 
        Authorization: `Bearer ${TOKEN}`,
        'User-Agent': 'ShortMax-App/1.0'
      }
    });
    
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: 'Upstream error', status: response.status, body: text.slice(0, 200) });
    }
    
    res.json(await response.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
