export interface Tag {
  tagId: number
  tagName: string
  tagEnName: string
}

export interface Drama {
  bookId: string
  bookName: string
  introduction: string
  cover: string
  chapterCount: number
  playCount: string
  tags: string[]
  tagDetails: Tag[]
}

export interface Episode {
  episodeId?: string
  chapterId?: string
  episodeIndex?: number
  chapterIndex?: number
  videoUrl?: string
  title?: string
}
