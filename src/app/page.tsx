import { api } from '@/lib/api';
import { extractList } from '@/lib/utils';
import HeroBanner from '@/components/HeroBanner';
import DramaCarousel from '@/components/DramaCarousel';
import ContinueWatching from '@/components/ContinueWatching';

export const revalidate = 300;

export default async function HomePage() {
  try {
    const [forYouData, newData, rankData] = await Promise.all([
      api.getForYou(1),
      api.getNewReleases(1, 10),
      api.getRanking(1),
    ]);

    const forYouList = extractList(forYouData);
    const newList = extractList(newData);
    const rankList = extractList(rankData);

    return (
      <div>
        <HeroBanner dramas={forYouList} />

        <div className="container mx-auto px-4 lg:px-8 -mt-16 relative z-10 pb-12">
          <ContinueWatching />

          <DramaCarousel
            title="แนะนำสำหรับคุณ"
            dramas={forYouList}
            viewAllHref="/category"
          />

          <DramaCarousel
            title="เรื่องใหม่ล่าสุด"
            dramas={newList}
            viewAllHref="/new-releases"
          />

          <DramaCarousel
            title="ยอดนิยม"
            dramas={rankList}
            viewAllHref="/ranking"
            showRank
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading home page:', error);
    return (
      <div className="pt-16 container mx-auto px-4 py-20 text-center">
        <p className="text-xl text-gray-400">ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง</p>
      </div>
    );
  }
}
