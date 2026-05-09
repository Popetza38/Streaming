import { useState, useEffect, useCallback } from 'react'
import api from '@/api/client'
import type { Drama, Episode } from '@/types'

export function useForYou(page = 1) {
  const [data, setData] = useState<Drama[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/home?page=${page}&size=10&lang=th`)
      .then((res: any) => setData(res.data.data?.list || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [page])

  return { data, loading }
}

export function useRank() {
  const [data, setData] = useState<Drama[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/rank?lang=th`)
      .then((res: any) => setData(res.data.data?.list || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}

export function useDramaDetail(id: string) {
  const [data, setData] = useState<Drama | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    setLoading(true)
    api.get(`/drama/${id}?lang=th`)
      .then((res: any) => setData(res.data.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [id])

  return { data, loading }
}

export function useEpisodes(bookId: string) {
  const [data, setData] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!bookId) { setLoading(false); return }
    api.get(`/drama/${bookId}/episodes?lang=th`)
      .then((res: any) => setData(res.data.data?.episodes || res.data.data?.chapterList || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [bookId])

  return { data, loading }
}

export function useSearch(keyword: string) {
  const [data, setData] = useState<Drama[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!keyword) { setData([]); return }
    setLoading(true)
    api.get(`/search?keyword=${encodeURIComponent(keyword)}&page=1&lang=th`)
      .then((res: any) => setData(res.data.data?.list || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [keyword])

  return { data, loading }
}

export function useHomeInfinite() {
  const [data, setData] = useState<Drama[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    api.get(`/home?page=1&size=50&lang=th`)
      .then((res: any) => {
        const list = res.data.data?.list || []
        setData(list)
        setHasMore(list.length >= 50)
        setPage(2)
      })
      .finally(() => setLoading(false))
  }, [])

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return
    setLoading(true)
    api.get(`/home?page=${page}&size=50&lang=th`)
      .then((res: any) => {
        const list = res.data.data?.list || []
        setData((prev: Drama[]) => [...prev, ...list])
        setHasMore(list.length >= 50)
        setPage((p: number) => p + 1)
      })
      .finally(() => setLoading(false))
  }, [page, loading, hasMore])

  return { data, loading, hasMore, loadMore }
}
