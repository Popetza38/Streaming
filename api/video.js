import axios from 'axios'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const videoUrl = req.query.url
  if (!videoUrl) return res.status(400).send('Missing url')

  const fullUrl = `https://${videoUrl}`

  try {
    if (videoUrl.includes('.m3u8')) {
      const response = await axios.get(fullUrl)
      let text = response.data
      const baseUrl = videoUrl.substring(0, videoUrl.lastIndexOf('/') + 1)

      // Rewrite .ts segments
      text = text.replace(/^(?!#)(.+\.ts.*)$/gm, (match) => {
        if (match.startsWith('http')) {
          return `/video?url=${encodeURIComponent(match.replace('https://', ''))}`
        }
        return `/video?url=${encodeURIComponent(baseUrl + match)}`
      })

      // Rewrite sub-manifests
      text = text.replace(/^(?!#)(.+\.m3u8.*)$/gm, (match) => {
        if (match.startsWith('http')) {
          return `/video?url=${encodeURIComponent(match.replace('https://', ''))}`
        }
        return `/video?url=${encodeURIComponent(baseUrl + match)}`
      })

      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
      res.setHeader('Cache-Control', 'public, max-age=300')
      return res.send(text)
    }

    const response = await axios.get(fullUrl, { responseType: 'stream' })
    res.setHeader('Content-Type', response.headers['content-type'])
    res.setHeader('Cache-Control', 'public, max-age=3600')
    response.data.pipe(res)
  } catch (err) {
    res.status(500).send('Video proxy error')
  }
}
