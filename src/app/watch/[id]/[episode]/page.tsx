import { Metadata } from 'next';
import WatchClient from './WatchClient';
import { api } from '@/lib/api';
import { extractList, getDramaTitle } from '@/lib/utils';

export const revalidate = 0;

interface PageProps {
  params: { id: string; episode: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const drama = await api.getDramaDetail(params.id);
    const title = getDramaTitle(drama);
    const episodeNum = parseInt(params.episode) + 1;

    return {
      title: `${title} - ตอนที่ ${episodeNum} - DramaPop`,
    };
  } catch {
    return {
      title: 'รับชมซีรีส์ - DramaPop',
    };
  }
}

export default async function WatchPage({ params }: PageProps) {
  try {
    const episodeIndex = parseInt(params.episode);

    const [videoData, chaptersData, drama] = await Promise.all([
      api.getVideoUrl(params.id, episodeIndex),
      api.getChapters(params.id),
      api.getDramaDetail(params.id),
    ]);

    const episodes = extractList(chaptersData);

    return (
      <WatchClient
        videoData={videoData}
        episodes={episodes}
        drama={drama}
        dramaId={params.id}
        currentEpisode={episodeIndex}
      />
    );
  } catch (error) {
    console.error('Error loading watch page:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">ไม่สามารถโหลดวิดีโอได้ กรุณาลองใหม่อีกครั้ง</p>
        </div>
      </div>
    );
  }
}
