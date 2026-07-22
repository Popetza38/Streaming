import axios from 'axios';

const API_URL = process.env.API_URL || 'https://api.hoshiyomi.my.id';
const PRIMARY_KEY = process.env.HOSHIYOMI_API_KEY || process.env.AUTH_TOKEN || 'HOSHIYOMI-FREE-e96e9f3f';
const API_KEYS = [PRIMARY_KEY, 'HOSHIYOMI-TRIAL'];

async function fetchWithKeyFailover(url) {
  let lastError;
  for (const apiKey of API_KEYS) {
    try {
      const response = await axios.get(url, {
        headers: { 
          'X-API-Key': apiKey,
          'User-Agent': 'Streaming-Hoshiyomi/1.0'
        },
        transformResponse: [(data) => data]
      });
      return response;
    } catch (err) {
      lastError = err;
      if (err.response?.status === 429 || err.response?.status === 401) {
        console.warn(`[Proxy Failover] Key ${apiKey} returned ${err.response?.status}, switching to backup key...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let pathname = '';
  let queryString = '';

  if (req.query && req.query.route) {
    pathname = '/' + (Array.isArray(req.query.route) ? req.query.route.join('/') : req.query.route);
    const { route, ...otherQueries } = req.query;
    queryString = new URLSearchParams(otherQueries).toString();
  } else {
    const path = req.url.replace('/api', '');
    [pathname, queryString] = path.split('?');
  }

  let targetPath = pathname;
  const params = new URLSearchParams(queryString);

  if (pathname === '/home' || pathname === '/rank') {
    targetPath = '/dramabox/trending';
  } else if (pathname === '/foryou') {
    targetPath = '/dramabox/foryou';
  } else if (pathname === '/new') {
    targetPath = '/dramabox/latest';
  } else if (pathname === '/search') {
    targetPath = '/dramabox/search';
    if (params.has('keyword') && !params.has('q')) {
      params.set('q', params.get('keyword'));
    }
  } else if (pathname.startsWith('/drama/')) {
    const parts = pathname.split('/');
    const id = parts[2];
    if (parts[3] === 'episodes') {
      targetPath = '/dramabox/allepisode';
      params.set('id', id);
    } else {
      targetPath = '/dramabox/detail';
      params.set('id', id);
    }
  }

  try {
    const queryStr = params.toString();
    const url = `${API_URL}/api${targetPath}${queryStr ? '?' + queryStr : ''}`;
    
    const response = await fetchWithKeyFailover(url);

    let rawData = response.data;
    if (typeof rawData === 'string') {
      let trimmed = rawData.trim();
      if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        try {
          rawData = JSON.parse(trimmed);
        } catch (e) {}
      }
    }

    if (typeof rawData === 'string') {
      let cleanText = rawData.trim();
      if (cleanText.includes('#EXTM3U')) {
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        return res.send(cleanText);
      }

      try {
        const jsonData = JSON.parse(cleanText);
        return res.json(jsonData);
      } catch (e) {
        return res.send(cleanText);
      }
    }

    res.json(rawData);

  } catch (err) {
    res.status(err.response?.status || 500).json({ 
      error: 'Hoshiyomi API Request Error',
      details: err.response?.data || err.message
    });
  }
}
