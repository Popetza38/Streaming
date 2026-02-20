// Encoded API configuration
const _k = 'aHR0cHM6Ly9yZXN0eGRiLm9ucmVuZGVyLmNvbS9hcGk=';
const _d = (s: string) => typeof window === 'undefined' ? Buffer.from(s, 'base64').toString() : atob(s);
const API_BASE = typeof window === 'undefined' ? _d(_k) : '/api';

export async function fetchAPI(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}

export const api = {
  getForYou: (page: number = 1) =>
    fetchAPI(`/foryou/${page}?lang=th`),

  getNewReleases: (page: number = 1, pageSize: number = 10) =>
    fetchAPI(`/new/${page}?lang=th&pageSize=${pageSize}`),

  getRanking: (page: number = 1) =>
    fetchAPI(`/rank/${page}?lang=th`),

  getClassify: (genreId?: string, page: number = 1, sort: number = 1) => {
    const params = new URLSearchParams({ lang: 'th', pageNo: page.toString(), sort: sort.toString() });
    if (genreId) params.append('genre', genreId);
    return fetchAPI(`/classify?${params.toString()}`);
  },

  search: (keyword: string, page: number = 1) =>
    fetchAPI(`/search/${encodeURIComponent(keyword)}/${page}?lang=th`),

  getSuggestions: (keyword: string) =>
    fetchAPI(`/suggest/${encodeURIComponent(keyword)}?lang=th`),

  getChapters: (bookId: string) =>
    fetchAPI(`/chapters/${bookId}?lang=th`),

  getVideoUrl: async (bookId: string, chapterIndex: number) => {
    try {
      return await fetchAPI(`/watch/${bookId}/${chapterIndex}?lang=th&source=search_result`);
    } catch (error) {
      return await fetchAPI('/watch/player?lang=th', {
        method: 'POST',
        body: JSON.stringify({ bookId, chapterIndex, lang: 'th' }),
      });
    }
  },

  getDramaDetail: async (bookId: string) => {
    // Search across listing endpoints for drama metadata
    const endpoints = [
      `/foryou/1?lang=th`,
      `/foryou/2?lang=th`,
      `/rank/1?lang=th`,
      `/new/1?lang=th&pageSize=20`,
    ];

    for (const endpoint of endpoints) {
      try {
        const data = await fetchAPI(endpoint);
        const list = data?.data?.list || data?.data?.bookList || [];
        const found = list.find((d: any) => String(d.bookId) === String(bookId));
        if (found) return found;
      } catch {
        continue;
      }
    }

    // If not found in listings, return minimal object with bookId
    return { bookId };
  },
};
