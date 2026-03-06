import axios from 'axios';
import keyDeriver from '../src/utils/keyDeriver.cjs';
const { deriveKey, decryptSegment, keyCache } = keyDeriver;

// In-Memory API Cache for hot serverless instances
const apiCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Decode obfuscated credentials
const _d = (s) => Buffer.from(s, 'base64').toString('utf-8');

const BASE_API_URL = process.env.BASE_API_URL || 'https://captain.sapimu.au';
const API_TOKEN = process.env.API_TOKEN || '';

// Platform API URLs derived from BASE_API_URL
const DB_API_URL = `${BASE_API_URL}/dramabox/api/v1`;
const SM_API_URL = `${BASE_API_URL}/shortmax/api/v1`;
const SB_API_URL = `${BASE_API_URL}/shortbox/api`;
const FLEX_API_URL = `${BASE_API_URL}/flextv/api/v1`;
const DP_API_URL = `${BASE_API_URL}/dramapops/api/v1`;
const DB_BITE_API_URL = `${BASE_API_URL}/dramabite/api`;
const FD_API_URL = `${BASE_API_URL}/fundrama/api/v1`;

// All platforms currently share the same token
const DB_TOKEN = API_TOKEN;
const SM_TOKEN = API_TOKEN;
const SB_TOKEN = API_TOKEN;
const FLEX_TOKEN = API_TOKEN;
const DP_TOKEN = API_TOKEN;
const DB_BITE_TOKEN = API_TOKEN;
const FD_TOKEN = API_TOKEN;

const DB_ALLOWED_PATHS = ['/foryou/', '/new/', '/rank/', '/search/', '/suggest/', '/classify', '/chapters/', '/watch/'];
const SM_ALLOWED_PATHS = ['/foryou', '/detail', '/play', '/search', '/feed', '/home'];
const SB_ALLOWED_PATHS = ['/list', '/new-list', '/hot-search', '/detail/', '/episodes/', '/search'];
const FLEX_ALLOWED_PATHS = ['/tabs', '/series', '/play', '/search', '/languages'];
const DP_ALLOWED_PATHS = ['/homepage', '/dramas', '/drama', '/search', '/languages', '/config'];
const DB_BITE_ALLOWED_PATHS = ['/v1/foryou', '/v1/dramas', '/v1/drama', '/v1/recommend', '/v1/search', '/v1/hot', '/v1/languages', '/v1/drama/'];
const FD_ALLOWED_PATHS = ['/foryou', '/dramas', '/drama', '/recommend', '/search', '/hot', '/languages', '/drama/'];

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

  // Parse platform and other params
  const params = new URLSearchParams(queryString || '');
  const platform = params.get('platform') || 'dramabox';
  const targetUrlParam = params.get('url');
  const kid = params.get('kid');
  const action = params.get('action');

  // 1. SB-Proxy handler (CDN & Video Segments)
  if (action === 'sb-proxy' || req.url.startsWith('/sb-proxy') || pathname === '/sb-proxy') {
    if (!targetUrlParam) return res.status(400).end('Missing url');

    try {
      const resp = await axios.get(targetUrlParam, {
        headers: {
          'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
          'Referer': 'https://www.shortbox.com/'
        },
        responseType: 'arraybuffer',
        timeout: 10000
      });

      const ct = resp.headers['content-type'] || 'application/octet-stream';

      if (ct.includes('mpegurl') || targetUrlParam.split('?')[0].endsWith('.m3u8')) {
        let text = Buffer.from(resp.data).toString('utf-8');
        const base = targetUrlParam.substring(0, targetUrlParam.lastIndexOf('/') + 1);

        // Remove DRM key line
        text = text.replace(/^#EXT-X-KEY:.*$/gm, '');

        // Rewrite paths
        const rewrite = (line) => {
          const full = line.startsWith('http') ? line : base + line;
          let pUrl = '/sb-proxy?url=' + encodeURIComponent(full);
          if (kid) pUrl += '&kid=' + encodeURIComponent(kid);
          return pUrl;
        };

        text = text.replace(/^(?!#)(.+\.ts.*)$/gm, rewrite);
        text = text.replace(/^(?!#)(.+\.m3u8.*)$/gm, rewrite);

        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        return res.end(text);
      } else {
        let buf = Buffer.from(resp.data);
        const kidVal = params.get('kid');

        // If kid is provided, check if we need to decrypt (starts with NOT 0x47)
        if (kidVal && buf.length > 0 && buf[0] !== 0x47) {
          const keyStr = keyCache.get(kidVal);
          if (keyStr) {
            try {
              buf = decryptSegment(buf, keyStr);
            } catch (err) {
              console.error(`Decryption failed for kid ${kidVal}:`, err.message);
            }
          }
        }

        res.setHeader('Content-Type', ct);
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return res.send(buf);
      }
    } catch (err) {
      return res.status(502).end(`Proxy error: ${err.message}`);
    }
  }

  // 2. Derive-key handler
  if (action === 'derive-key' || req.url.startsWith('/derive-key') || pathname === '/derive-key') {
    const playAuth = params.get('playAuth');
    const kidVal = params.get('kid');

    if (!playAuth || !kidVal) {
      return res.status(400).end('Missing playAuth or kid');
    }

    try {
      await deriveKey(playAuth, kidVal);
      return res.json({ status: 'ok', kid: kidVal });
    } catch (err) {
      console.error('[derive-key] Error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // 3. Image proxy handler
  if (action === 'img' || req.url.startsWith('/img') || pathname === '/img') {
    if (!targetUrlParam) return res.status(400).end('Missing url');
    try {
      const resp = await axios.get(targetUrlParam, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        responseType: 'arraybuffer'
      });
      res.setHeader('Content-Type', resp.headers['content-type'] || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(resp.data);
    } catch (err) {
      return res.status(502).end('Image fetch failed');
    }
  }

  // 4. DramaPops routing
  if (platform === 'dramapops') {
    if (!DP_ALLOWED_PATHS.some(p => pathname.startsWith(p))) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!DP_TOKEN) {
      return res.status(500).json({ error: 'DramaPops token not configured.' });
    }

    try {
      // Strip internal params before forwarding to upstream
      const dpParams = new URLSearchParams(queryString || '');
      dpParams.delete('platform');
      dpParams.delete('action');
      const dpCleanQuery = dpParams.toString();
      const url = `${DP_API_URL}${pathname}${dpCleanQuery ? '?' + dpCleanQuery : ''}`;

      if (apiCache.has(url) && apiCache.get(url).expiry > Date.now()) {
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.setHeader('X-Cache', 'HIT');
        return res.json(apiCache.get(url).data);
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${DP_TOKEN}`,
          'User-Agent': 'DramaPops-App/1.0'
        }
      });

      apiCache.set(url, { data: response.data, expiry: Date.now() + CACHE_TTL });
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.setHeader('X-Cache', 'MISS');
      res.json(response.data);
    } catch (err) {
      res.status(err.response?.status || 500).json({
        error: 'DramaPops API request failed',
        details: err.message
      });
    }
    return;
  }

  // 5. FlexTV routing
  if (platform === 'flextv') {
    if (!FLEX_ALLOWED_PATHS.some(p => pathname.startsWith(p))) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!FLEX_TOKEN) {
      return res.status(500).json({ error: 'FlexTV token not configured.' });
    }

    // Strip internal params (platform, action) before forwarding to upstream
    const flexParams = new URLSearchParams(queryString || '');
    flexParams.delete('platform');
    flexParams.delete('action');
    const flexCleanQuery = flexParams.toString();

    try {
      const url = `${FLEX_API_URL}${pathname}${flexCleanQuery ? '?' + flexCleanQuery : ''}`;

      if (apiCache.has(url) && apiCache.get(url).expiry > Date.now()) {
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.setHeader('X-Cache', 'HIT');
        return res.json(apiCache.get(url).data);
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${FLEX_TOKEN}`,
          'User-Agent': 'FlexTV-App/1.0'
        },
        timeout: 15000,
      });

      apiCache.set(url, { data: response.data, expiry: Date.now() + CACHE_TTL });
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.setHeader('X-Cache', 'MISS');
      res.json(response.data);
    } catch (err) {
      res.status(err.response?.status || 500).json({
        error: 'FlexTV API request failed',
        details: err.message
      });
    }
    return;
  }

  params.delete('platform');
  params.delete('action');
  const cleanQuery = params.toString();

  if (platform === 'shortbox') {
    // ShortBox routing
    if (!SB_ALLOWED_PATHS.some(p => pathname.startsWith(p))) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!SB_TOKEN) {
      return res.status(500).json({ error: 'ShortBox token not configured.' });
    }

    try {
      const url = `${SB_API_URL}${pathname}${cleanQuery ? '?' + cleanQuery : ''}`;

      if (apiCache.has(url) && apiCache.get(url).expiry > Date.now()) {
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.setHeader('X-Cache', 'HIT');
        return res.json(apiCache.get(url).data);
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${SB_TOKEN}`,
          'User-Agent': 'ShortBox-App/1.0'
        },
        timeout: 30000,
      });

      apiCache.set(url, { data: response.data, expiry: Date.now() + CACHE_TTL });
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.setHeader('X-Cache', 'MISS');
      res.json(response.data);
    } catch (err) {
      res.status(err.response?.status || 500).json({
        error: 'ShortBox API request failed',
        details: err.message
      });
    }
  } else if (platform === 'shortmax') {
    // ShortMax routing
    if (!SM_ALLOWED_PATHS.some(p => pathname.startsWith(p))) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!SM_TOKEN) {
      return res.status(500).json({ error: 'ShortMax token not configured.' });
    }

    try {
      const url = `${SM_API_URL}${pathname}${cleanQuery ? '?' + cleanQuery : ''}`;

      if (apiCache.has(url) && apiCache.get(url).expiry > Date.now()) {
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.setHeader('X-Cache', 'HIT');
        return res.json(apiCache.get(url).data);
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${SM_TOKEN}`,
          'User-Agent': 'ShortMax-App/1.0'
        }
      });

      apiCache.set(url, { data: response.data, expiry: Date.now() + CACHE_TTL });
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.setHeader('X-Cache', 'MISS');
      res.json(response.data);
    } catch (err) {
      res.status(err.response?.status || 500).json({
        error: 'ShortMax API request failed',
        details: err.message
      });
    }
  } else if (platform === 'dramabite') {
    // DramaBite routing
    if (!DB_BITE_ALLOWED_PATHS.some(p => pathname.startsWith(p))) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!DB_BITE_TOKEN) {
      return res.status(500).json({ error: 'DramaBite token not configured.' });
    }

    try {
      const url = `${DB_BITE_API_URL}${pathname}${cleanQuery ? '?' + cleanQuery : ''}`;

      if (apiCache.has(url) && apiCache.get(url).expiry > Date.now()) {
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.setHeader('X-Cache', 'HIT');
        return res.json(apiCache.get(url).data);
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${DB_BITE_TOKEN}`,
          'User-Agent': 'DramaBite-App/1.0'
        }
      });

      apiCache.set(url, { data: response.data, expiry: Date.now() + CACHE_TTL });
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.setHeader('X-Cache', 'MISS');
      res.json(response.data);
    } catch (err) {
      res.status(err.response?.status || 500).json({
        error: 'DramaBite API request failed',
        details: err.message
      });
    }
  } else if (platform === 'fundrama') {
    // FunDrama routing
    if (!FD_ALLOWED_PATHS.some(p => pathname.startsWith(p))) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!FD_TOKEN) {
      return res.status(500).json({ error: 'FunDrama token not configured.' });
    }

    try {
      const url = `${FD_API_URL}${pathname}${cleanQuery ? '?' + cleanQuery : ''}`;

      if (apiCache.has(url) && apiCache.get(url).expiry > Date.now()) {
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.setHeader('X-Cache', 'HIT');
        return res.json(apiCache.get(url).data);
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${FD_TOKEN}`,
          'User-Agent': 'FunDrama-App/1.0'
        }
      });

      apiCache.set(url, { data: response.data, expiry: Date.now() + CACHE_TTL });
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.setHeader('X-Cache', 'MISS');
      res.json(response.data);
    } catch (err) {
      res.status(err.response?.status || 500).json({
        error: 'FunDrama API request failed',
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

      if (apiCache.has(url) && apiCache.get(url).expiry > Date.now()) {
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.setHeader('X-Cache', 'HIT');
        return res.json(apiCache.get(url).data);
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${DB_TOKEN}`,
          'User-Agent': 'DramaPop-Proxy/1.0'
        }
      });

      apiCache.set(url, { data: response.data, expiry: Date.now() + CACHE_TTL });
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.setHeader('X-Cache', 'MISS');
      res.json(response.data);
    } catch (err) {
      res.status(err.response?.status || 500).json({
        error: 'API request failed',
        details: err.message
      });
    }
  }
}
