'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Search, TrendingUp, Clock } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'หน้าหลัก' },
    { href: '/category', icon: Grid, label: 'หมวดหมู่' },
    { href: '/search', icon: Search, label: 'ค้นหา' },
    { href: '/ranking', icon: TrendingUp, label: 'อันดับ' },
    { href: '/new-releases', icon: Clock, label: 'ล่าสุด' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-surface border-t border-gray-800 z-40">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive ? 'text-primary' : 'text-gray-400'
                }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
