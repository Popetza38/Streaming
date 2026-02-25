import axios from 'axios';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { deriveKey, decryptSegment, keyCache } = require('../src/utils/keyDeriver.cjs');

// Decode obfuscated credentials
const _d = (s) => Buffer.from(s, 'base64').toString('utf-8');

// DramaBox
const DB_API_URL = _d(process.env.API_URL_E || '') || process.env.API_URL || '';
const DB_TOKEN = _d(process.env.AUTH_TOKEN_E || '') || process.env.AUTH_TOKEN || '';

// ShortMax
const SM_API_URL = process.env.SM_API_URL || 'https://captain.sapimu.au/shortmax/api/v1';
const SM_TOKEN = process.env.SM_AUTH_TOKEN || '';

// ShortBox
const SB_API_URL = process.env.SB_API_URL || 'https://captain.sapimu.au/shortbox/api';
const SB_TOKEN = process.env.SB_API_TOKEN || '';

const DB_ALLOWED_PATHS = ['/foryou/', '/new/', '/rank/', '/search/', '/suggest/', '/classify', '/chapters/', '/watch/'];
const SM_ALLOWED_PATHS = ['/foryou', '/detail/', '/play/', '/search', '/feed/', '/home'];
const SB_ALLOWED_PATHS = ['/list', '/new-list', '/hot-search', '/detail/', '/episodes/', '/search'];

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

  // 1. SB-Proxy handler (CDN & Video Segments)
  if (req.url.startsWith('/sb-proxy') || pathname === '/sb-proxy') {
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
  if (req.url.startsWith('/derive-key') || pathname === '/derive-key') {
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
  if (req.url.startsWith('/img') || pathname === '/img') {
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

  params.delete('platform');
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
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${SB_TOKEN}`,
          'User-Agent': 'ShortBox-App/1.0'
        },
        timeout: 30000,
      });

      res.setHeader('Cache-Control', 'public, max-age=300');
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
