import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import ScrollToTop from '@/components/ScrollToTop';
import BackToTop from '@/components/BackToTop';

export const metadata: Metadata = {
  title: 'DramaPop - สตรีมมิ่งซีรีส์จีนยอดนิยม',
  description: 'รับชมซีรีส์จีนใหม่ล่าสุดและยอดนิยมพร้อมซับไทย ซีรีส์หลายพันตอนรับชมฟรี',
  keywords: 'ซีรีส์จีน, สตรีมมิ่ง, ซีรีส์เอเชีย, ซับไทย',
  openGraph: {
    title: 'DramaPop - สตรีมมิ่งซีรีส์จีนยอดนิยม',
    description: 'รับชมซีรีส์จีนใหม่ล่าสุดและยอดนิยมพร้อมซับไทย',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <ScrollToTop />
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <MobileNav />
        <BackToTop />
      </body>
    </html>
  );
}
