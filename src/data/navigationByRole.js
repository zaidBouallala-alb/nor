export const navItemsByRole = {
  Administrator: [
    { label: 'الرئيسية', to: '/' },
    { label: 'مواقيت الصلاة', to: '/prayer-times' },
    { label: 'الأذكار', to: '/athkar' },
    { label: 'القرآن', to: '/quran' },
    { label: 'تفاصيل السورة', to: '/surah/1' },
  ],
  Director: [
    { label: 'الرئيسية', to: '/' },
    { label: 'مواقيت الصلاة', to: '/prayer-times' },
    { label: 'اتجاه القبلة', to: '/qibla' },
    { label: 'القرآن', to: '/quran' },
  ],
  Teacher: [
    { label: 'الرئيسية', to: '/' },
    { label: 'مواقيت الصلاة', to: '/prayer-times' },
    { label: 'القرآن', to: '/quran' },
    { label: 'تفاصيل السورة', to: '/surah/2' },
  ],
  Student: [
    { label: 'الرئيسية', to: '/' },
    { label: 'اتجاه القبلة', to: '/qibla' },
    { label: 'مواقيت الصلاة', to: '/prayer-times' },
    { label: 'عداد التسبيح', to: '/tasbih' },
    { label: 'الأذكار', to: '/athkar' },
    { label: 'القرآن', to: '/quran' },
  ],
  Parent: [
    { label: 'الرئيسية', to: '/' },
    { label: 'مواقيت الصلاة', to: '/prayer-times' },
    { label: 'الأذكار', to: '/athkar' },
    { label: 'القرآن', to: '/quran' },
  ],
  Accountant: [
    { label: 'الرئيسية', to: '/' },
    { label: 'مواقيت الصلاة', to: '/prayer-times' },
    { label: 'اتجاه القبلة', to: '/qibla' },
  ],
}
