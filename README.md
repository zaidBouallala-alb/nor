# نُور — Noor Islamic Companion

تطبيق ويب إسلامي متكامل مبني بـ React + Vite بواجهة عربية RTL وتصميم داكن ذهبي.

## المميزات

- مواقيت الصلاة (مدينة / إحداثيات) مع تحديد الصلاة القادمة.
- بوصلة القبلة الذكية مع دعم اتجاه الجهاز على الموبايل.
- القرآن الكريم (114 سورة) مع دعم العمل بدون إنترنت.
- صفحة الأذكار التفاعلية مع تتبع التقدم والحفظ المحلي.
- عدّاد تسبيح ذكي (أذكار جاهزة + ذكر مخصص + تقدم دائري).
- لوحة رئيسية Dashboard ذكية (وقت، تاريخ، اختصارات، آخر قراءة).
- إعدادات تجربة القراءة (الحجم، النمط، التأثيرات).

## التقنيات المستخدمة

- React 19
- React Router 7
- Vite 7
- Tailwind CSS 4
- TanStack React Query
- Axios

## التشغيل محليًا

```bash
npm install
npm run dev
```

ثم افتح:

```bash
http://localhost:5173
```

## البناء للإنتاج

```bash
npm run build
npm run preview
```

## بنية المشروع

```text
src/
  components/   # مكونات الواجهة (Topbar, Sidebar, Layout...)
  pages/        # صفحات التطبيق (Quran, Athkar, Qibla, PrayerTimes...)
  data/         # بيانات محلية/احتياطية (Quran, Athkar, Prayer samples)
  utils/        # خدمات وعمليات مساعدة (APIs, countdown, qibla math)
```

## ملاحظات

- التطبيق يعتمد على APIs خارجية (AlAdhan / Nominatim) مع fallback محلي عند الحاجة.
- يتم حفظ التفضيلات وبعض بيانات التقدم في `localStorage`.