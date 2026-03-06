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
    language?: string;
}

/* ===== Detect Thai language from tags or name ===== */
function detectLangFromTags(tags: any[], name?: string): string | undefined {
    const thaiRegex = /[\u0E00-\u0E7F]/;
    // Check tags
    if (Array.isArray(tags)) {
        for (const tag of tags) {
            const label = typeof tag === 'string' ? tag : tag?.tagName ?? tag?.tag_name ?? '';
            if (thaiRegex.test(label)) return 'th';
        }
    }
    // Check name
    if (name && thaiRegex.test(name)) return 'th';
    return undefined;
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
        const tags = (raw.tag_list ?? []).map((t: any) => typeof t === 'string' ? t : t?.tag_name ?? '');
        return {
            id: String(raw.shortplay_id ?? raw.drama_id ?? raw.id ?? ''),
            name: raw.title ?? '',
            cover: imgUrl ? `/img?url=${encodeURIComponent(imgUrl)}` : '',
            episodes: raw.total ?? 0,
            summary: raw.desc ?? '',
            playCount: '',
            score: undefined,
            tags,
            corner: undefined,
            rank: undefined,
            language: detectLangFromTags(raw.tag_list ?? [], raw.title),
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
            language: detectLangFromTags(raw.tags ?? [], raw.name),
        };
    }

    if (platform === 'flextv') {
        const imgUrl = raw.cover || '';
        const tags = (raw.tag_list ?? []).map((t: any) => typeof t === 'string' ? t : t?.tag_name ?? '');
        return {
            id: String(raw.series_id ?? raw.id ?? ''),
            name: raw.series_name ?? '',
            cover: imgUrl,
            episodes: raw.last_series_no ?? 0,
            summary: raw.description ?? '',
            playCount: raw.watch_num ?? '',
            score: undefined,
            tags,
            corner: undefined,
            rank: undefined,
            language: detectLangFromTags(raw.tag_list ?? [], raw.series_name),
        };
    }

    if (platform === 'dramapops') {
        const cover = raw.poster ?? raw.cover ?? (raw.poster_uri_prefix && raw.poster_uri_suffix ? `${raw.poster_uri_prefix}${raw.poster_uri_suffix}` : '');
        const watchCt = raw.watchCount ?? raw.watch_count;

        let epCount = 0;
        if (raw.totalEpisodes !== undefined) {
            epCount = raw.totalEpisodes;
        } else if (raw.episodes !== undefined) {
            epCount = raw.episodes;
        } else if (raw.episode_prices) {
            epCount = Object.keys(raw.episode_prices).length;
        } else {
            // Homepage doesn't return anything. We set it to undefined or -1 so UI can hide it.
            epCount = undefined as any;
        }

        return {
            id: String(raw.id ?? raw.slug ?? ''),
            name: raw.title ?? raw.name ?? raw.movie_unique_title ?? '',
            cover: cover,
            episodes: epCount,
            summary: raw.description ?? raw.summary ?? '',
            playCount: watchCt ? `${(watchCt / 1000).toFixed(1)}K` : '',
            score: raw.rating ?? undefined,
            tags: raw.tags ?? [],
            corner: undefined,
            rank: undefined,
            language: detectLangFromTags(raw.tags ?? [], raw.title ?? raw.name),
        };
    }

    if (platform === 'dramabite') {
        const episodesProp = raw.episodes;
        const isEpisodesArr = Array.isArray(episodesProp);

        // If title is missing at top level, try to extract from the first episode's title
        let name = raw.title ?? raw.name ?? '';
        if (!name && isEpisodesArr && episodesProp.length > 0 && episodesProp[0].title) {
            // "Drama Title-1" or "Drama Title-Episode 1" -> "Drama Title"
            const parts = episodesProp[0].title.split('-');
            if (parts.length > 1) {
                const lastPart = parts[parts.length - 1].trim();
                if (/^\d+$/.test(lastPart) || lastPart.toLowerCase().includes('episode')) {
                    name = parts.slice(0, -1).join('-').trim();
                } else {
                    name = episodesProp[0].title.trim();
                }
            } else {
                name = episodesProp[0].title.trim();
            }
        }

        let epCount = 0;
        if (typeof episodesProp === 'number') {
            epCount = episodesProp;
        } else if (isEpisodesArr) {
            epCount = episodesProp.length;
        } else if (raw.episodes_count) {
            epCount = raw.episodes_count;
        } else if (raw.total_episodes) {
            epCount = raw.total_episodes;
        }

        return {
            id: String(raw.id ?? ''),
            name: name,
            cover: raw.cover || raw.thumbnail || raw.poster || '',
            episodes: epCount,
            summary: raw.description ?? raw.synopsis ?? '',
            playCount: raw.view_count ? (raw.view_count > 1000 ? `${(raw.view_count / 1000).toFixed(1)}K` : String(raw.view_count)) : '',
            score: raw.rating ?? undefined,
            tags: raw.genres ?? raw.tags ?? [],
            corner: undefined,
            rank: undefined,
            language: detectLangFromTags(raw.genres ?? raw.tags ?? [], name),
        };
    }

    if (platform === 'fundrama') {
        const cover = raw.ptear ?? '';
        let name = raw.nsin ?? '';
        return {
            id: String(raw.dshame ?? ''),
            name: name,
            cover: cover,
            episodes: raw.eshe ?? 0,
            summary: raw.dentra ?? '',
            playCount: '',
            score: undefined,
            tags: [],
            corner: undefined,
            rank: undefined,
            language: raw.lhomew ?? undefined,
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
        language: detectLangFromTags(raw.tagDetails ?? raw.tags ?? [], raw.bookName),
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
    if (platform === 'dramapops') {
        // DramaPops homepage: { success, data: [{ name, movies: [...] }] }
        // DramaPops trending/popular/search: { success, data: [...] }
        const d = data?.data;
        if (Array.isArray(d)) {
            // Check if it's homepage sections (array of objects with 'movies')
            if (d.length > 0 && d[0]?.movies) {
                const list: any[] = [];
                d.forEach((section: any) => {
                    if (Array.isArray(section.movies)) list.push(...section.movies);
                });
                return list;
            }
            return d;
        }
        return [];
    }
    if (platform === 'dramabite') {
        // DramaBite: returns a root-level array directly
        if (Array.isArray(data)) {
            // Recommend endpoint returns [{ category, dramas: [...] }]
            if (data.length > 0 && data[0]?.dramas) {
                const list: any[] = [];
                data.forEach((section: any) => {
                    if (Array.isArray(section.dramas)) list.push(...section.dramas);
                });
                return list;
            }
            // foryou, dramas, search: returns flat array of dramas
            return data;
        }
        // Fallback for possible wrapped responses
        const d = data?.data;
        if (Array.isArray(d)) return d;
        return [];
    }
    if (platform === 'fundrama') {
        // rank/foryou: { data: { ddriv: { lsumm: [...] } } }
        const lsumm = data?.data?.ddriv?.lsumm;
        if (Array.isArray(lsumm)) return lsumm;
        // search: { data: { results: [...] } }
        const results = data?.data?.results;
        if (Array.isArray(results)) return results;
        // default fallback
        return Array.isArray(data?.data) ? data.data : [];
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

    if (platform === 'dramapops') {
        // DramaPops video: { qualities: [{ videoUrl, quality, bitrate }] }
        const qualities = data?.qualities || [];
        // Pick best quality available (1080p > 720p > 480p > 360p)
        const best = qualities.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))[0];
        const videoUrl = best?.videoUrl || data?.videoUrl || '';
        return {
            name: data?.name ?? data?.title ?? '',
            cover: data?.cover ?? data?.poster ?? '',
            videoUrl,
            summary: data?.description ?? data?.summary ?? '',
            isHls: videoUrl.includes('.m3u8'),
        };
    }

    if (platform === 'dramabite') {
        // Episode response: { id, number, title, video: 'm3u8_url', validFor: 1800 }
        const videoUrl = data?.video ?? data?.play_url ?? data?.video_url ?? data?.url ?? '';
        let name = data?.episodeTitle ?? data?.dramaTitle ?? data?.title ?? '';
        // If it's a detail object with episodes array
        if (!name && data?.episodes?.length > 0) {
            const epTitle = data.episodes[0].title || '';
            const parts = epTitle.split('-');
            if (parts.length > 1) {
                const lastPart = parts[parts.length - 1].trim();
                if (/^\d+$/.test(lastPart) || lastPart.toLowerCase().includes('episode')) {
                    name = parts.slice(0, -1).join('-').trim();
                } else {
                    name = epTitle.trim();
                }
            } else {
                name = epTitle.trim();
            }
        }

        let cover = data?.cover || data?.thumbnail || data?.poster || '';

        // If root cover is missing, try to get it from the first episode
        if (!cover && data?.episodes?.[0]) {
            const ep = data.episodes[0];
            cover = ep.cover || ep.thumbnail || ep.poster || '';
        }

        return {
            name: name,
            cover: cover,
            videoUrl,
            summary: data?.description ?? data?.synopsis ?? '',
            isHls: videoUrl.includes('.m3u8'),
        };
    }

    if (platform === 'fundrama') {
        const eclimEp = data?.eclimEp;
        const ptitl = eclimEp?.ptitl || data?.fdar || [];

        let videoUrl = '';
        if (ptitl.length > 0) {
            // Sort by Wsecto (height) or Dspee (resolution string like 1080P) if available
            const sorted = [...ptitl].sort((a: any, b: any) => {
                const heightA = a.Wsecto || parseInt(a.Dspee) || 0;
                const heightB = b.Wsecto || parseInt(b.Dspee) || 0;
                return heightB - heightA;
            });
            videoUrl = sorted[0]?.Mbrie || ptitl[0]?.Mbrie || '';
        }

        if (!videoUrl && data?.videoUrl) {
            videoUrl = data.videoUrl;
        } else if (!videoUrl && data?.url) {
            videoUrl = data.url;
        }

        return {
            name: data?.nsin ?? '',
            cover: data?.ptear ?? '',
            videoUrl,
            summary: data?.dentra ?? '',
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

    if (platform === 'dramapops') {
        // DramaPops: generate episodes from totalEpisodes
        const count = totalEpisodes ?? 0;
        return Array.from({ length: count }, (_, i) => ({
            id: String(i + 1),
            index: i,
        }));
    }

    if (platform === 'dramabite') {
        // DramaBite: episodes come from drama detail as [{id, number, title, free}]
        const episodes = data?.episodes || [];
        if (Array.isArray(episodes) && episodes.length > 0) {
            return episodes.map((ep: any) => ({
                id: String(ep.id ?? ep.number ?? ''),
                index: (ep.number ?? ep.id ?? 1) - 1,
            }));
        }
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
