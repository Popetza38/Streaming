# 🎬 DramaPop

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)

**แพลตฟอร์มสตรีมมิ่งซีรีส์จีน** — ดีไซน์สไตล์ Netflix พร้อม Video Player แบบ Custom และ UI ภาษาไทย

</div>

---

## ✨ ฟีเจอร์หลัก

| ฟีเจอร์ | รายละเอียด |
|---------|-----------|
| 🎥 **Video Player** | HLS streaming, keyboard shortcuts, auto-next episode พร้อมนับถอยหลัง |
| 🔍 **ค้นหา** | Auto-suggest, debounce, กรองตามแนว, เรียงลำดับ |
| 📱 **Responsive** | Mobile-first, bottom nav, touch-friendly |
| 🌙 **Netflix Dark Theme** | สีแดง `#e50914`, glassmorphism, card-hover effects, Inter font |
| 📺 **ดูต่อ (Watch History)** | บันทึกประวัติลง localStorage พร้อม progress bar |
| ⚡ **เร็ว** | SSR, ISR, image optimization, code splitting |

## 🚀 เริ่มต้นใช้งาน

```bash
# Clone
git clone https://github.com/Popetza38/Streaming.git
cd Streaming

# ติดตั้ง
npm install

# รัน
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## 📁 โครงสร้างโปรเจค

```
src/
├── app/
│   ├── page.tsx                    # 🏠 หน้าหลัก (Hero + Carousel + ดูต่อ)
│   ├── drama/[id]/page.tsx         # 📺 รายละเอียดซีรีส์
│   ├── watch/[id]/[episode]/       # ▶️ หน้ารับชม + WatchClient
│   ├── search/page.tsx             # 🔍 ค้นหา
│   ├── category/page.tsx           # 🏷️ หมวดหมู่
│   ├── ranking/page.tsx            # 📊 อันดับ
│   ├── new-releases/page.tsx       # 🆕 ล่าสุด
│   ├── globals.css                 # 🎨 Netflix design system
│   └── layout.tsx                  # � Layout (lang="th")
├── components/
│   ├── Header.tsx                  # Navbar (gradient → glass)
│   ├── HeroBanner.tsx              # Hero แบบ crossfade
│   ├── DramaCard.tsx               # Card พร้อม hover effect
│   ├── DramaCarousel.tsx           # Carousel แนวนอน
│   ├── VideoPlayer.tsx             # HLS Player + auto-next
│   ├── ContinueWatching.tsx        # ดูต่อ + progress bar
│   ├── EpisodeList.tsx             # รายการตอน
│   ├── SearchBar.tsx               # แถบค้นหา
│   ├── GenreFilter.tsx             # ตัวกรองแนว
│   ├── MobileNav.tsx               # Bottom nav (มือถือ)
│   └── Footer.tsx                  # ส่วนท้าย
├── hooks/
│   └── useWatchHistory.ts          # Hook บันทึกประวัติการดู
├── lib/
│   ├── api.ts                      # API client (lang=th)
│   └── utils.ts                    # Helper functions
└── types/
    └── index.ts                    # TypeScript types
```

## 🎯 หน้าต่าง ๆ

| หน้า | Route | คำอธิบาย |
|------|-------|---------|
| หน้าหลัก | `/` | Hero banner + ดูต่อ + carousel แนะนำ/ใหม่/ยอดนิยม |
| รายละเอียด | `/drama/[id]` | ข้อมูลซีรีส์ + รายการตอน + ซีรีส์ที่เกี่ยวข้อง |
| รับชม | `/watch/[id]/[episode]` | Video player + sidebar ตอน + auto-next |
| ค้นหา | `/search` | ค้นหาพร้อม auto-suggest |
| หมวดหมู่ | `/category` | กรองตามแนว + เรียงลำดับ |
| อันดับ | `/ranking` | ซีรีส์ยอดนิยมพร้อม badge |
| ล่าสุด | `/new-releases` | ซีรีส์ใหม่ล่าสุด |

## ⌨️ Keyboard Shortcuts (Video Player)

| ปุ่ม | การทำงาน |
|------|---------|
| `Space` | เล่น/หยุด |
| `← →` | เลื่อน ±10 วินาที |
| `↑ ↓` | เพิ่ม/ลดเสียง |
| `F` | เต็มจอ |
| `M` | ปิด/เปิดเสียง |

## 🔌 API

Base URL: `https://restxdb.onrender.com/api`

| Endpoint | คำอธิบาย |
|----------|---------|
| `GET /foryou/{page}?lang=th` | แนะนำ |
| `GET /new/{page}?lang=th` | ล่าสุด |
| `GET /rank/{page}?lang=th` | อันดับ |
| `GET /classify?lang=th` | หมวดหมู่ |
| `GET /search/{keyword}/{page}?lang=th` | ค้นหา |
| `GET /suggest/{keyword}?lang=th` | แนะนำคำค้น |
| `GET /chapters/{bookId}?lang=th` | รายการตอน |
| `GET /watch/{bookId}/{index}?lang=th` | URL วิดีโอ |

## 📦 Tech Stack

- **Next.js 14** — App Router, SSR, ISR
- **TypeScript** — Type safety
- **Tailwind CSS** — Utility-first styling
- **HLS.js** — Video streaming
- **Lucide React** — Icons
- **localStorage** — Watch history

## � Deploy

```bash
# Vercel CLI
npm i -g vercel
vercel --prod
```

หรือ push ขึ้น GitHub แล้ว import ที่ [vercel.com](https://vercel.com)

## � License

MIT License

---

<div align="center">

Made with ❤️ by **PoP**

</div>
