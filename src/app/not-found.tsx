import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-black text-primary mb-4">404</h1>
          <h2 className="text-3xl font-semibold mb-2">ไม่พบหน้าที่ค้นหา</h2>
          <p className="text-gray-400 text-lg">
            ขออภัย ไม่พบหน้าที่คุณกำลังค้นหา
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="btn-netflix flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm"
          >
            <Home className="w-5 h-5" />
            กลับหน้าหลัก
          </Link>

          <Link
            href="/search"
            className="btn-ghost flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm"
          >
            <Search className="w-5 h-5" />
            ค้นหาซีรีส์
          </Link>
        </div>
      </div>
    </div>
  );
}
