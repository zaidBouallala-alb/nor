<div align="center">

# نُور — Noor

**رفيقك الإسلامي اليومي**

تطبيق ويب إسلامي تقدمي (PWA) مبني بـ React + Vite — واجهة عربية RTL بتصميم داكن ذهبي أنيق.

[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)]()

</div>

---

## المميزات

| الميزة | الوصف |
|--------|-------|
| **مواقيت الصلاة** | تحديد تلقائي بالموقع أو البحث بالمدينة — مع شريط تقدم ذكي وتنبيهات |
| **بوصلة القبلة** | اتجاه القبلة الذكي مع دعم بوصلة الجهاز على الموبايل |
| **القرآن الكريم** | 114 سورة كاملة — يعمل بدون إنترنت مع تخزين IndexedDB |
| **عدّاد التسبيح** | أذكار جاهزة + ذكر مخصص + تقدم دائري بصري |
| **الأذكار** | أذكار الصباح والمساء مع تتبع التقدم والحفظ المحلي |
| **الإعدادات** | حجم الخط • المظهر • وضع القراءة • الحركات — مع معاينة مباشرة |
| **PWA** | قابل للتثبيت على الهاتف والكمبيوتر — يعمل offline |

## التقنيات

- **React 19** + React Router 7
- **Vite 7** — بناء سريع مع vendor splitting
- **Tailwind CSS 4** — تصميم responsive + RTL
- **TanStack React Query** — إدارة البيانات والتخزين المؤقت
- **Service Worker** — تخزين مؤقت ذكي بأربع طبقات
- **IndexedDB** — تخزين بيانات القرآن offline (50MB+)

## التشغيل

```bash
# تثبيت المكتبات
npm install

# التشغيل للتطوير
npm run dev
```

افتح: [http://localhost:5173](http://localhost:5173)

## البناء للإنتاج

```bash
npm run build
npm run preview
```

## التثبيت كتطبيق

| المنصة | الطريقة |
|--------|---------|
| **Android / Chrome** | زر "تثبيت التطبيق" في الشريط العلوي |
| **iPhone / Safari** | زر المشاركة ← "Add to Home Screen" |
| **Desktop / Edge** | أيقونة التثبيت في شريط العنوان |

## بنية المشروع

```
src/
├── components/     # مكونات الواجهة (Topbar, Sidebar, AppCard...)
├── context/        # السياقات (Location, Preferences)
├── data/           # بيانات محلية/احتياطية (Quran, Athkar)
├── hooks/          # خطافات مخصصة (useDocTitle, useNextPrayerCountdown)
├── pages/          # صفحات التطبيق (8 صفحات)
├── utils/          # خدمات API ووظائف مساعدة
├── App.jsx         # التوجيه الرئيسي مع lazy loading
├── main.jsx        # نقطة الدخول + تسجيل Service Worker
└── index.css       # التصميم الأساسي والمتغيرات
public/
├── sw.js           # Service Worker (4-tier caching)
├── manifest.webmanifest
└── icons/          # أيقونات PWA (192 + 512)
```

## APIs المستخدمة

| API | الغرض |
|-----|-------|
| [AlAdhan](https://aladhan.com/prayer-times-api) | مواقيت الصلاة |
| [AlQuran Cloud](https://alquran.cloud/api) | نصوص القرآن الكريم |
| [Nominatim](https://nominatim.openstreetmap.org) | تحديد الموقع الجغرافي العكسي |

## ملاحظات

- يعمل التطبيق **بدون إنترنت** للقرآن والأذكار والتسبيح بعد أول تحميل.
- يتم حفظ التفضيلات والتقدم في **localStorage** و **IndexedDB**.
- جميع واجهات المستخدم بـ**العربية** — الكود بالإنجليزية.

---

<div align="center">

**صُنع بـ ❤️ لخدمة المسلمين**

</div>