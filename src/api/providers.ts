import type { StreamSource } from '../store/source';

// ============ Unified Types ============
export interface UnifiedDrama {
    id: string;
    name: string;
    cover: string;
    episodes: number;
    summary?: string;
    source: StreamSource;
    tags?: string[];
    playCount?: string;
    hotScore?: string;
}

export interface VideoData {
    videoUrl: string;
    videoType: 'hls' | 'mp4';
    cover?: string;
    qualities?: { quality: number; videoPath: string }[];
}

export interface RankSection {
    title: string;
    items: UnifiedDrama[];
}

// ============ ShortMax Adapter ============
const shortmaxAdapter = {
    async getForYou(page: number, lang: string): Promise<{ dramas: UnifiedDrama[]; hasMore: boolean }> {
        const res = await fetch(`/api/foryou?page=${page}&lang=${lang}`);
        const data = await res.json();
        const list = data.data || [];
        return {
            dramas: list.map(normalizeShortmax),
            hasMore: list.length >= 20,
        };
    },

    async search(query: string, lang: string, page: number): Promise<UnifiedDrama[]> {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&lang=${lang}&page=${page}`);
        const data = await res.json();
        return (data.data || []).map(normalizeShortmax);
    },

    async getDetail(id: string, lang: string): Promise<UnifiedDrama | null> {
        const res = await fetch(`/api/detail?code=${id}&lang=${lang}`);
        const data = await res.json();
        return data.data ? normalizeShortmax(data.data) : null;
    },

    async getVideo(id: string, episode: number, lang: string): Promise<VideoData | null> {
        const res = await fetch(`/api/play?code=${id}&ep=${episode}&lang=${lang}`);
        const data = await res.json();
        if (!data.data?.video?.video_720) return null;
        const originalUrl = data.data.video.video_720;
        return {
            videoUrl: `/video?url=${encodeURIComponent(originalUrl.replace('https://', ''))}`,
            videoType: 'hls',
        };
    },

    async getRank(lang: string): Promise<RankSection[]> {
        const res = await fetch(`/api/feed?type=ranked&lang=${lang}`);
        const data = await res.json();
        const sections = data.data || [];
        return sections.map((s: any) => ({
            title: s.title,
            items: (s.items || []).map(normalizeShortmax),
        }));
    },

    async getFeed(type: string, lang: string): Promise<any> {
        const res = await fetch(`/api/feed?type=${type}&lang=${lang}`);
        const data = await res.json();
        return data.data || [];
    },

    async getRomance(lang: string): Promise<UnifiedDrama[]> {
        const res = await fetch(`/api/feed?type=romance&lang=${lang}`);
        const data = await res.json();
        return (data.data || []).map(normalizeShortmax);
    },

    episodeLocked(ep: number): boolean {
        return ep >= 30;
    },

    getEpisodeParam(episode: number): number {
        return episode; // 1-based
    },
};

// ============ DramaBox Adapter ============
const dramaboxAdapter = {
    async getForYou(page: number, lang: string): Promise<{ dramas: UnifiedDrama[]; hasMore: boolean }> {
        const res = await fetch(`/api/dramabox/foryou?page=${page}&lang=${lang}`);
        const data = await res.json();
        const list = data.data?.list || [];
        return {
            dramas: list.map(normalizeDramabox),
            hasMore: data.data?.isMore ?? list.length >= 10,
        };
    },

    async search(query: string, lang: string, page: number): Promise<UnifiedDrama[]> {
        const res = await fetch(`/api/dramabox/search?q=${encodeURIComponent(query)}&lang=${lang}&page=${page}`);
        const data = await res.json();
        return (data.data?.list || []).map(normalizeDramabox);
    },

    async getDetail(id: string, lang: string): Promise<UnifiedDrama | null> {
        // DramaBox foryou already returns full info, but we can use chapters for episode count
        const res = await fetch(`/api/dramabox/chapters?bookId=${id}&lang=${lang}`);
        const data = await res.json();
        const chapters = data.data?.chapterList || [];
        // We need to return what we have - the detail is already in the drama card
        return {
            id,
            name: '',
            cover: '',
            episodes: chapters.length,
            source: 'dramabox',
        };
    },

    async getChapters(id: string, lang: string): Promise<{ episodes: number; chapters: any[] }> {
        const res = await fetch(`/api/dramabox/chapters?bookId=${id}&lang=${lang}`);
        const data = await res.json();
        const chapters = data.data?.chapterList || [];
        return { episodes: chapters.length, chapters };
    },

    async getVideo(id: string, episode: number, lang: string): Promise<VideoData | null> {
        const chapterIndex = episode - 1; // Convert 1-based to 0-based
        const res = await fetch(`/api/dramabox/watch?bookId=${id}&chapterIndex=${chapterIndex}&lang=${lang}`);
        const data = await res.json();
        if (!data.data?.videoUrl) return null;

        const qualities = (data.data.qualities || []).map((q: any) => ({
            quality: q.quality,
            videoPath: q.videoPath,
        }));

        // Prefer 720p default, fallback to first available
        const defaultQ = qualities.find((q: any) => q.quality === 720) || qualities[0];

        return {
            videoUrl: defaultQ?.videoPath || data.data.videoUrl,
            videoType: 'mp4',
            cover: data.data.cover,
            qualities,
        };
    },

    async getRank(lang: string): Promise<RankSection[]> {
        const res = await fetch(`/api/dramabox/rank?page=1&lang=${lang}`);
        const data = await res.json();
        const list = data.data?.list || [];
        return [{ title: 'Popular', items: list.map(normalizeDramabox) }];
    },

    async getNew(page: number, lang: string): Promise<UnifiedDrama[]> {
        const res = await fetch(`/api/dramabox/new?page=${page}&lang=${lang}&pageSize=10`);
        const data = await res.json();
        return (data.data?.list || []).map(normalizeDramabox);
    },

    async getRomance(lang: string): Promise<UnifiedDrama[]> {
        // DramaBox doesn't have romance feed, return new releases instead
        const res = await fetch(`/api/dramabox/new?page=1&lang=${lang}&pageSize=12`);
        const data = await res.json();
        return (data.data?.list || []).map(normalizeDramabox);
    },

    episodeLocked(_ep: number): boolean {
        return false; // DramaBox manages its own locks
    },

    getEpisodeParam(episode: number): number {
        return episode; // We handle conversion internally
    },
};

// ============ Normalizers ============
function normalizeShortmax(item: any): UnifiedDrama {
    return {
        id: String(item.code || item.id),
        name: item.name || '',
        cover: item.cover || '',
        episodes: item.episodes || 0,
        summary: item.summary || '',
        source: 'shortmax',
        hotScore: item.hotScore,
    };
}

function normalizeDramabox(item: any): UnifiedDrama {
    return {
        id: item.bookId || '',
        name: item.bookName || '',
        cover: item.cover || '',
        episodes: item.chapterCount || 0,
        summary: item.introduction || '',
        source: 'dramabox',
        tags: item.tags || [],
        playCount: item.playCount || '',
        hotScore: item.rank?.hotCode,
    };
}

// ============ Provider Factory ============
export function getProvider(source: StreamSource) {
    return source === 'dramabox' ? dramaboxAdapter : shortmaxAdapter;
}
