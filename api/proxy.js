import axios from 'axios';

// Decode obfuscated credentials
const _d = (s) => Buffer.from(s, 'base64').toString('utf-8');
const API_URL = _d(process.env.API_URL_E || '') || process.env.API_URL || '';
const TOKEN = _d(process.env.AUTH_TOKEN_E || '') || process.env.AUTH_TOKEN || '';

const ALLOWED_PATHS = ['/foryou/', '/new/', '/rank/', '/search/', '/suggest/', '/classify', '/chapters/', '/watch/'];

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.url.replace('/api', '');
  const [pathname, queryString] = path.split('?');

  if (!ALLOWED_PATHS.some(p => pathname.startsWith(p))) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (!TOKEN) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'Auth token not configured.'
    });
  }

  try {
    const url = `${API_URL}${pathname}${queryString ? '?' + queryString : ''}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'User-Agent': 'DramaPop-Proxy/1.0'
      }
    });

    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({
      error: 'API request failed',
      details: err.message
    });
  }
}
