import axios from 'axios';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const videoUrl = req.query.url;
    if (!videoUrl) {
        return res.status(400).send('Missing url parameter');
    }

    const fullUrl = `https://${videoUrl}`;

    try {
        if (videoUrl.includes('.m3u8')) {
            const response = await axios.get(fullUrl);
            let text = response.data;
            const baseUrl = videoUrl.substring(0, videoUrl.lastIndexOf('/') + 1);

            // Rewrite .ts segments to go through proxy
            text = text.replace(/^(?!#)(.+\.ts.*)$/gm, (match) => {
                if (match.startsWith('http')) {
                    return `/api/video?url=${encodeURIComponent(match.replace('https://', ''))}`;
                }
                return `/api/video?url=${encodeURIComponent(baseUrl + match)}`;
            });

            // Rewrite sub-manifests
            text = text.replace(/^(?!#)(.+\.m3u8.*)$/gm, (match) => {
                if (match.startsWith('http')) {
                    return `/api/video?url=${encodeURIComponent(match.replace('https://', ''))}`;
                }
                return `/api/video?url=${encodeURIComponent(baseUrl + match)}`;
            });

            res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
            res.setHeader('Cache-Control', 'public, max-age=300');
            return res.send(text);
        }

        // Binary stream (TS segments)
        const response = await axios.get(fullUrl, { responseType: 'arraybuffer' });
        res.setHeader('Content-Type', response.headers['content-type'] || 'video/mp2t');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return res.send(Buffer.from(response.data));
    } catch (err) {
        console.error('Video proxy error:', err.message);
        return res.status(500).send('Video proxy error');
    }
}
