import Link from 'next/link';
import { Film } from 'lucide-react';

export default function Footer() {
  const genres = ['Romance', 'Action', 'Comedy', 'Drama', 'Fantasy', 'Historical'];

  return (
    <footer className="bg-dark-surface/80 border-t border-white/5 mt-20">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">DramaPop</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              แพลตฟอร์มสตรีมมิ่งซีรีส์จีนยอดนิยม พร้อมซีรีส์หลายพันตอนและซับไทย
              รับชมได้ทุกที่ทุกเวลา
            </p>
          </div>

          {/* Menu */}
          <div>
            <h3 className="font-semibold text-sm text-white mb-4 uppercase tracking-wider">เมนู</h3>
            <ul className="space-y-2.5">
              <li><Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors duration-200">หน้าหลัก</Link></li>
              <li><Link href="/category" className="text-gray-500 hover:text-white text-sm transition-colors duration-200">หมวดหมู่</Link></li>
              <li><Link href="/ranking" className="text-gray-500 hover:text-white text-sm transition-colors duration-200">อันดับ</Link></li>
              <li><Link href="/new-releases" className="text-gray-500 hover:text-white text-sm transition-colors duration-200">ล่าสุด</Link></li>
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h3 className="font-semibold text-sm text-white mb-4 uppercase tracking-wider">แนวยอดนิยม</h3>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-xs text-gray-500 hover:text-white hover:border-white/15 transition-all duration-200 cursor-pointer"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">&copy; {new Date().getFullYear()} DramaPop. สงวนลิขสิทธิ์ทั้งหมด</p>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-xs hover:text-gray-400 cursor-pointer transition-colors">นโยบายความเป็นส่วนตัว</span>
            <span className="text-gray-700">·</span>
            <span className="text-gray-600 text-xs hover:text-gray-400 cursor-pointer transition-colors">ข้อกำหนดการใช้งาน</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
