import axios from 'axios';

// Decode obfuscated credentials
const _d = (s) => Buffer.from(s, 'base64').toString('utf-8');

// DramaBox
const DB_API_URL = _d(process.env.API_URL_E || '') || process.env.API_URL || '';
const DB_TOKEN = _d(process.env.AUTH_TOKEN_E || '') || process.env.AUTH_TOKEN || '';

// ShortMax
const SM_API_URL = process.env.SM_API_URL || 'https://captain.sapimu.au/shortmax/api/v1';
const SM_TOKEN = process.env.SM_AUTH_TOKEN || '';

const DB_ALLOWED_PATHS = ['/foryou/', '/new/', '/rank/', '/search/', '/suggest/', '/classify', '/chapters/', '/watch/'];
const SM_ALLOWED_PATHS = ['/foryou', '/detail/', '/play/', '/search', '/feed/', '/home'];

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

  // Parse platform from query string
  const params = new URLSearchParams(queryString || '');
  const platform = params.get('platform') || 'dramabox';
  params.delete('platform');
  const cleanQuery = params.toString();

  if (platform === 'shortmax') {
    // ShortMax routing
    if (!SM_ALLOWED_PATHS.some(p => pathname.startsWith(p))) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!SM_TOKEN) {
      return res.status(500).json({ error: 'ShortMax token not configured.' });
    }

    try {
      const url = `${SM_API_URL}${pathname}${cleanQuery ? '?' + cleanQuery : ''}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${SM_TOKEN}`,
          'User-Agent': 'ShortMax-App/1.0'
        }
      });

      res.setHeader('Cache-Control', 'public, max-age=300');
      res.json(response.data);
    } catch (err) {
      res.status(err.response?.status || 500).json({
        error: 'ShortMax API request failed',
        details: err.message
      });
    }
  } else {
    // DramaBox routing (default)
    if (!DB_ALLOWED_PATHS.some(p => pathname.startsWith(p))) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!DB_TOKEN) {
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Auth token not configured.'
      });
    }

    try {
      const url = `${DB_API_URL}${pathname}${cleanQuery ? '?' + cleanQuery : ''}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${DB_TOKEN}`,
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
}
