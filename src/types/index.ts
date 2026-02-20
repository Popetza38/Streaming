export interface Drama {
  bookId?: string;
  id?: string;
  dramaId?: string;
  book_id?: string;
  bookName?: string;
  name?: string;
  title?: string;
  replacedBookName?: string;
  cover?: string;
  coverWap?: string;
  poster?: string;
  image?: string;
  introduction?: string;
  description?: string;
  desc?: string;
  tag?: string | string[];
  typeTwoList?: string[];
  typeTwoName?: string;
  totalChapterNum?: number;
  chapterCount?: number;
  episodeCount?: number;
  viewNum?: number;
  views?: number;
  score?: number;
  rating?: number;
  status?: string;
  isFinish?: boolean;
  [key: string]: any;
}

export interface Episode {
  chapterIndex?: number;
  index?: number;
  episodeIndex?: number;
  chapterName?: string;
  name?: string;
  title?: string;
  isFree?: boolean;
  free?: boolean;
  isLock?: boolean;
  locked?: boolean;
  [key: string]: any;
}

export interface Genre {
  id?: string;
  genreId?: string;
  categoryId?: string;
  name?: string;
  categoryName?: string;
  genreName?: string;
  [key: string]: any;
}

export interface ApiResponse {
  code?: number;
  status?: number;
  message?: string;
  msg?: string;
  data?: any;
  list?: any[];
  bookList?: any[];
  [key: string]: any;
}

export interface VideoData {
  videoUrl?: string;
  video_url?: string;
  url?: string;
  playUrl?: string;
  data?: {
    videoUrl?: string;
    video_url?: string;
    url?: string;
    playUrl?: string;
  };
  [key: string]: any;
}
