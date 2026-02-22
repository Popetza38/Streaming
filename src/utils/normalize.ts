import type { Platform } from '../store/platform';

/* ===== Unified Drama type used by all pages ===== */
export interface NormalizedDrama {
    id: string;
    name: string;
    cover: string;
    episodes: number;
    summary?: string;
    playCount?: string;
    tags?: string[];
    corner?: { name: string; color: string };
    rank?: { hotCode: string };
}

export interface NormalizedWatchData {
    name: string;
    cover: string;
    videoUrl: string;
    summary?: string;
    isHls: boolean;
}

export interface NormalizedChapter {
    id: string;
    index: number;
}

/* ===== Normalize a single drama from either platform ===== */
export function normalizeDrama(raw: any, platform: Platform): NormalizedDrama {
    if (platform === 'shortmax') {
        return {
            id: String(raw.code ?? raw.id ?? ''),
            name: raw.name ?? '',
            cover: raw.cover ?? '',
            episodes: raw.episodes ?? 0,
            summary: raw.summary ?? '',
            playCount: raw.playCount ?? '',
            tags: raw.tags ?? [],
            corner: raw.corner ?? undefined,
            rank: raw.rank ?? undefined,
        };
    }

    // dramabox
    return {
        id: raw.bookId ?? '',
        name: (raw.bookName ?? '').trim(),
        cover: raw.cover ?? '',
        episodes: raw.chapterCount ?? 0,
        summary: raw.introduction ?? '',
        playCount: raw.playCount ?? '',
        tags: raw.tags ?? [],
        corner: raw.corner ?? undefined,
        rank: raw.rank ?? undefined,
    };
}

/* ===== Normalize a list ===== */
export function normalizeDramaList(list: any[], platform: Platform): NormalizedDrama[] {
    return (list || []).map(item => normalizeDrama(item, platform));
}

/* ===== Extract list from API response based on platform ===== */
export function extractList(data: any, platform: Platform): any[] {
    if (platform === 'shortmax') {
        return data?.data || [];
    }
    // dramabox wraps in { success, data: { list } }
    return data?.data?.list || [];
}

/* ===== Normalize watch data ===== */
export function normalizeWatchData(data: any, platform: Platform): NormalizedWatchData | null {
    if (!data) return null;

    if (platform === 'shortmax') {
        const videoUrl = data?.video?.video_720 || data?.video?.video_480 || '';
        return {
            name: data?.name ?? '',
            cover: data?.cover ?? '',
            videoUrl,
            summary: data?.summary ?? '',
            isHls: videoUrl.includes('.m3u8'),
        };
    }

    // dramabox
    return {
        name: data?.bookName ?? '',
        cover: data?.bookCover ?? data?.cover ?? '',
        videoUrl: data?.videoUrl ?? '',
        summary: data?.introduction ?? '',
        isHls: (data?.videoUrl ?? '').includes('.m3u8'),
    };
}

/* ===== Normalize chapters ===== */
export function normalizeChapters(data: any, platform: Platform, totalEpisodes?: number): NormalizedChapter[] {
    if (platform === 'shortmax') {
        // ShortMax doesn't have a chapters endpoint; generate from total
        const count = totalEpisodes ?? 0;
        return Array.from({ length: count }, (_, i) => ({
            id: String(i + 1),
            index: i,
        }));
    }

    // dramabox
    const list = data?.data?.chapterList || [];
    return list.map((ch: any) => ({
        id: ch.chapterId ?? String(ch.chapterIndex),
        index: ch.chapterIndex ?? 0,
    }));
}
