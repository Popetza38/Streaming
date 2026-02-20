import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Heart, Film, Eye } from 'lucide-react';
import { api } from '@/lib/api';
import ShareButton from '@/components/ShareButton';
import {
  extractList,
  getDramaTitle,
  getDramaCover,
  getDramaTags,
  getDramaDescription,
  getEpisodeCount,
  getDramaViews,
  getDramaStatus,
  formatViews,
} from '@/lib/utils';
import EpisodeList from '@/components/EpisodeList';
import DramaCarousel from '@/components/DramaCarousel';

export const revalidate = 300;

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const drama = await api.getDramaDetail(params.id);
    const title = getDramaTitle(drama);
    const description = getDramaDescription(drama);

    return {
      title: `${title} - DramaPop`,
      description,
      openGraph: {
        title,
        description,
        images: [getDramaCover(drama)],
      },
    };
  } catch {
    return {
      title: 'Drama - DramaPop',
    };
  }
}

export default async function DramaDetailPage({ params }: PageProps) {
  try {
    const [drama, chaptersData, relatedData] = await Promise.all([
      api.getDramaDetail(params.id),
      api.getChapters(params.id),
      api.getForYou(1).catch(() => ({ data: [] })),
    ]);

    const episodes = extractList(chaptersData);
    const relatedDramas = extractList(relatedData)
      .filter((d: any) => String(d.bookId) !== String(params.id))
      .slice(0, 10);

    const title = getDramaTitle(drama);
    const cover = getDramaCover(drama);
    const tags = getDramaTags(drama);
    const description = getDramaDescription(drama);
    const episodeCount = getEpisodeCount(drama) || episodes.length;
    const views = getDramaViews(drama);
    const status = getDramaStatus(drama);
    const playCount = drama.playCount || '';

    return (
      <div className="min-h-screen">
        {/* Hero Background */}
        <div className="relative h-[60vh] md:h-[70vh]">
          <Image
            src={cover}
            alt={title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-dark-bg/85 to-dark-bg/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/30 to-transparent" />

          {/* Hero Content */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="container mx-auto px-4 lg:px-8 pb-12">
              <div className="flex flex-col md:flex-row gap-8 items-end">
                {/* Poster Card */}
                <div className="hidden md:block w-52 flex-shrink-0">
                  <div className="relative aspect-drama rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
                    <Image
                      src={cover}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="208px"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 pb-2">
                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {tags.slice(0, 4).map((tag: string, index: number) => (
                        <span key={index} className="tag-pill">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <h1 className="text-3xl md:text-5xl font-black text-white text-shadow-hero leading-tight tracking-tight mb-4">
                    {title}
                  </h1>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 mb-5 text-sm">
                    <span className="flex items-center gap-1.5 text-gray-300">
                      <Film className="w-4 h-4 text-primary" />
                      {episodeCount} ตอน
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${status === 'จบแล้ว'
                      ? 'bg-accent/15 text-accent'
                      : 'bg-blue-500/15 text-blue-400'
                      }`}>
                      {status}
                    </span>
                    {playCount && (
                      <>
                        <span className="text-gray-600">•</span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <Eye className="w-3.5 h-3.5" />
                          {playCount}
                        </span>
                      </>
                    )}
                    {views > 0 && !playCount && (
                      <>
                        <span className="text-gray-600">•</span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <Eye className="w-3.5 h-3.5" />
                          {formatViews(views)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/watch/${params.id}/0`}
                      className="btn-netflix flex items-center gap-2  px-7 py-3 rounded-md text-sm"
                    >
                      <Play className="w-5 h-5 fill-white" />
                      ดูเลย
                    </Link>

                    <button className="btn-ghost flex items-center gap-2 px-5 py-3 rounded-md text-sm backdrop-blur-md">
                      <Heart className="w-4 h-4" />
                      ชื่นชอบ
                    </button>

                    <ShareButton />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Below Hero */}
        <div className="container mx-auto px-4 lg:px-8 py-10">
          {/* Description */}
          <div className="max-w-3xl mb-10">
            <h2 className="text-lg font-semibold text-white mb-3">เรื่องย่อ</h2>
            <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
          </div>

          {/* Episodes */}
          <div className="mb-12">
            <EpisodeList episodes={episodes} dramaId={params.id} dramaTitle={title} dramaCover={cover} />
          </div>

          {/* Related */}
          {relatedDramas.length > 0 && (
            <DramaCarousel title="ซีรีส์ที่เกี่ยวข้อง" dramas={relatedDramas} />
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading drama detail:', error);
    return (
      <div className="pt-16 container mx-auto px-4 py-20 text-center">
        <p className="text-xl text-gray-400">ไม่สามารถโหลดรายละเอียดซีรีส์ได้ กรุณาลองใหม่อีกครั้ง</p>
      </div>
    );
  }
}
