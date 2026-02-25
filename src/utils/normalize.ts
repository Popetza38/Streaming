import type { Platform } from '../store/platform';

/* ===== Unified Drama type used by all pages ===== */
export interface NormalizedDrama {
    id: string;
    name: string;
    cover: string;
    episodes: number;
    summary?: string;
    playCount?: string;
    score?: number;
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
    // ShortBox DRM fields
    playAuth?: string;
    kid?: string;
    qualities?: Array<{
        url: string;
        playAuth: string;
        kid: string;
        height: number;
        label: string;
    }>;
}

export interface NormalizedChapter {
    id: string;
    index: number;
}

/* ===== Normalize a single drama from either platform ===== */
export function normalizeDrama(raw: any, platform: Platform): NormalizedDrama {
    if (platform === 'shortbox') {
        const imgUrl = raw.cover_image || raw.cover_image_thumb?.thumb || raw.cover_image_thumb || '';
        return {
            id: String(raw.shortplay_id ?? raw.drama_id ?? raw.id ?? ''),
            name: raw.title ?? '',
            cover: imgUrl ? `/img?url=${encodeURIComponent(imgUrl)}` : '',
            episodes: raw.total ?? 0,
            summary: raw.desc ?? '',
            playCount: '',
            score: undefined,
            tags: (raw.tag_list ?? []).map((t: any) => typeof t === 'string' ? t : t?.tag_name ?? ''),
            corner: undefined,
            rank: undefined,
        };
    }

    if (platform === 'shortmax') {
        return {
            id: String(raw.code ?? raw.id ?? ''),
            name: raw.name ?? '',
            cover: raw.cover ?? '',
            episodes: raw.episodes ?? 0,
            summary: raw.summary ?? '',
            playCount: raw.playCount ?? '',
            score: raw.score ?? raw.star ?? undefined,
            tags: raw.tags ?? [],
            corner: raw.corner ?? undefined,
            rank: raw.rank ?? undefined,
        };
    }

    if (platform === 'flextv') {
        const imgUrl = raw.cover || '';
        return {
            id: String(raw.series_id ?? raw.id ?? ''),
            name: raw.series_name ?? '',
            cover: imgUrl,
            episodes: raw.last_series_no ?? 0,
            summary: raw.description ?? '',
            playCount: raw.watch_num ?? '',
            score: undefined,
            tags: (raw.tag_list ?? []).map((t: any) => typeof t === 'string' ? t : t?.tag_name ?? ''),
            corner: undefined,
            rank: undefined,
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
        score: raw.score ?? raw.star ?? undefined,
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
    if (platform === 'shortbox') {
        // ShortBox: { code: 0, data: { data: [...] } } or { code: 0, data: [...] }
        const d = data?.data;
        if (Array.isArray(d)) return d;
        if (d?.data && Array.isArray(d.data)) return d.data;
        return [];
    }
    if (platform === 'shortmax') {
        return data?.data || [];
    }
    if (platform === 'flextv') {
        // FlexTV: { code: 0, data: { list: [...] } } or { data: [...] } or { data: { floor: [{ series_list: [...] }] } }
        const dataObj = data?.data || data;
        if (Array.isArray(dataObj)) return dataObj;
        if (dataObj?.list && Array.isArray(dataObj.list)) return dataObj.list;

        // Handle nested floor structure: data.floor[0].series_list
        if (dataObj?.floor && Array.isArray(dataObj.floor)) {
            const list: any[] = [];
            dataObj.floor.forEach((f: any) => {
                const sl = f.series_list || f.list || [];
                if (Array.isArray(sl)) list.push(...sl);
            });
            return list;
        }
        return [];
    }
    // dramabox wraps in { success, data: { list } }
    return data?.data?.list || [];
}

/* ===== Normalize watch data ===== */
export function normalizeWatchData(data: any, platform: Platform): NormalizedWatchData | null {
    if (!data) return null;

    if (platform === 'shortbox') {
        // ShortBox: video info comes from episode play_info_list
        const pil = data?.play_info_list || [];
        if (pil.length === 0 && data?.videoUrl) {
            // Already processed
            return {
                name: data?.name ?? '',
                cover: data?.cover ?? '',
                videoUrl: data.videoUrl,
                summary: data?.summary ?? '',
                isHls: true,
                playAuth: data?.playAuth,
                kid: data?.kid,
                qualities: data?.qualities,
            };
        }

        const sorted = [...pil].sort((a: any, b: any) => (b.Height || 0) - (a.Height || 0));
        const best = sorted[0];
        const playUrl = best?.MainPlayUrl || best?.BackupPlayUrl || '';
        const playAuth = best?.PlayAuth || '';
        const kid = best?.PlayAuthId || '';

        const qualities = sorted.map((q: any) => ({
            url: q.MainPlayUrl || q.BackupPlayUrl || '',
            playAuth: q.PlayAuth || '',
            kid: q.PlayAuthId || '',
            height: q.Height || 0,
            label: q.Height ? `${q.Height}p` : q.Definition || 'Default',
        }));

        return {
            name: data?.name ?? data?.title ?? '',
            cover: data?.cover ?? '',
            videoUrl: playUrl,
            summary: data?.summary ?? data?.desc ?? '',
            isHls: true,
            playAuth,
            kid,
            qualities,
        };
    }

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

    if (platform === 'flextv') {
        const videoUrl = data?.video_url || '';
        return {
            name: data?.series_name ?? data?.name ?? '',
            cover: data?.cover ?? '',
            videoUrl,
            summary: data?.description ?? data?.summary ?? '',
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
    if (platform === 'shortbox') {
        // ShortBox: episodes come from /episodes endpoint
        const episodes = data?.data?.episodes || data?.episodes || [];
        if (Array.isArray(episodes) && episodes.length > 0) {
            return episodes.map((ep: any, i: number) => ({
                id: String(ep.episode_id ?? ep.episode_index ?? i + 1),
                index: (ep.episode_index ?? i + 1) - 1,
            }));
        }
        // Fallback: generate from total
        const count = totalEpisodes ?? 0;
        return Array.from({ length: count }, (_, i) => ({
            id: String(i + 1),
            index: i,
        }));
    }

    if (platform === 'shortmax') {
        // ShortMax doesn't have a chapters endpoint; generate from total
        const count = totalEpisodes ?? 0;
        return Array.from({ length: count }, (_, i) => ({
            id: String(i + 1),
            index: i,
        }));
    }

    if (platform === 'flextv') {
        // FlexTV: episodes come from /episodes endpoint
        const episodes = data?.data || data || [];
        if (Array.isArray(episodes) && episodes.length > 0) {
            return episodes.map((ep: any) => ({
                id: String(ep.id),
                index: ep.series_no - 1,
            }));
        }
        // Fallback: generate from total
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
