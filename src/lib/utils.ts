import { Drama, Episode, Genre, ApiResponse, VideoData } from '@/types';

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function extractList(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.data?.list) return data.data.list;
  if (data.data?.bookList) return data.data.bookList;
  if (data.data?.chapterList) return data.data.chapterList;
  if (data.list) return data.list;
  if (data.bookList) return data.bookList;
  if (data.chapterList) return data.chapterList;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

export function extractGenres(data: any): Genre[] {
  if (!data) return [];
  if (data.data?.categoryList) return data.data.categoryList;
  if (data.categoryList) return data.categoryList;
  if (data.data?.genreList) return data.data.genreList;
  if (data.genreList) return data.genreList;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

export function getDramaId(drama: Drama): string {
  return drama.bookId || drama.id || drama.dramaId || drama.book_id || '';
}

export function getDramaTitle(drama: Drama): string {
  return drama.bookName || drama.name || drama.title || drama.replacedBookName || 'ไม่มีชื่อ';
}

export function getDramaCover(drama: Drama): string {
  return drama.cover || drama.coverWap || drama.poster || drama.image || '/placeholder.jpg';
}

export function getDramaTags(drama: Drama): string[] {
  if (Array.isArray(drama.tag)) return drama.tag;
  if (typeof drama.tag === 'string') return drama.tag.split(',').map(t => t.trim());
  if (Array.isArray(drama.typeTwoList)) return drama.typeTwoList;
  if (drama.typeTwoName) return [drama.typeTwoName];
  return [];
}

export function getDramaDescription(drama: Drama): string {
  return drama.introduction || drama.description || drama.desc || 'ไม่มีคำอธิบาย';
}

export function getEpisodeCount(drama: Drama): number {
  return drama.totalChapterNum || drama.chapterCount || drama.episodeCount || 0;
}

export function getDramaViews(drama: Drama): number {
  return drama.viewNum || drama.views || 0;
}

export function getDramaRating(drama: Drama): number {
  return drama.score || drama.rating || 0;
}

export function getDramaStatus(drama: Drama): string {
  if (drama.status) return drama.status;
  if (drama.isFinish === true) return 'จบแล้ว';
  if (drama.isFinish === false) return 'Ongoing';
  return 'Unknown';
}

export function getEpisodeIndex(episode: Episode): number {
  return episode.chapterIndex ?? episode.index ?? episode.episodeIndex ?? 0;
}

export function getEpisodeName(episode: Episode): string {
  return episode.chapterName || episode.name || episode.title || `Episode ${getEpisodeIndex(episode) + 1}`;
}

export function isEpisodeLocked(episode: Episode): boolean {
  if (episode.isFree === true || episode.free === true) return false;
  if (episode.isCharge === 1 || episode.isPay === 1) return true;
  if (episode.isLock === true || episode.locked === true) return true;
  return false;
}

export function getVideoUrl(data: VideoData): string {
  if (data.videoUrl) return data.videoUrl;
  if (data.video_url) return data.video_url;
  if (data.url) return data.url;
  if (data.playUrl) return data.playUrl;
  if (data.data?.videoUrl) return data.data.videoUrl;
  if (data.data?.video_url) return data.data.video_url;
  if (data.data?.url) return data.data.url;
  if (data.data?.playUrl) return data.data.playUrl;
  return '';
}

export function getGenreId(genre: Genre): string {
  return genre.id || genre.genreId || genre.categoryId || '';
}

export function getGenreName(genre: Genre): string {
  return genre.name || genre.categoryName || genre.genreName || 'Unknown';
}

export function formatViews(num: number): string {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}
