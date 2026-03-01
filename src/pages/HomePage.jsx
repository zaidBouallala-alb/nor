import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AppBadge from '../components/AppBadge'
import AppCard from '../components/AppCard'
import AppSectionTitle from '../components/AppSectionTitle'
import { fetchPrayerTimesBySmartPlace, fetchPrayerTimesByCoordinates, getSmartFallbackCity } from '../utils/prayerTimesApi'
import { getPrayerTimesFallback } from '../data/prayerTimesSample'
import useNextPrayerCountdown from '../hooks/useNextPrayerCountdown'
import { useLocation } from '../context/LocationContext'
import useDocTitle from '../hooks/useDocTitle'

/* ─── prayer name map ─── */
const prayerNameAr = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
}

const prayerIcons = {
  Fajr: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  ),
  Sunrise: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  ),
  Dhuhr: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  ),
  Asr: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 19.5h20" />
    </svg>
  ),
  Maghrib: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 17h18" />
    </svg>
  ),
  Isha: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9 .913 2.476L13.15 12l-2.487.524L9.75 15l-.913-2.476L6.35 12l2.487-.524L9.75 9Z" />
    </svg>
  ),
}

/* ─── daily ayah pool ─── */
const dailyAyahs = [
  { text: 'إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا', ref: 'الشرح : 6' },
  { text: 'وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُ', ref: 'الطلاق : 3' },
  { text: 'وَٱذْكُرُوا۟ ٱللَّهَ كَثِيرًا لَّعَلَّكُمْ تُفْلِحُونَ', ref: 'الجمعة : 10' },
  { text: 'رَبِّ ٱشْرَحْ لِى صَدْرِى وَيَسِّرْ لِىٓ أَمْرِى', ref: 'طه : 25-26' },
  { text: 'فَٱذْكُرُونِىٓ أَذْكُرْكُمْ', ref: 'البقرة : 152' },
  { text: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰٓ', ref: 'الضحى : 5' },
  { text: 'ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ', ref: 'البقرة : 255' },
]

/* ─── daily tips pool ─── */
const dailyTips = [
  'أكثر من الاستغفار فإنه يفرج الهم ويوسّع الرزق.',
  'صلاة الفجر في جماعة نور يوم القيامة.',
  'أذكار الصباح والمساء حصنك من كل سوء.',
  'لا تنسَ قراءة سورة الكهف يوم الجمعة.',
  'الصدقة تطفئ غضب الرب وتدفع ميتة السوء.',
  'من قرأ آية الكرسي بعد كل صلاة لم يمنعه من دخول الجنة إلا الموت.',
  'التسبيح بعد الصلاة 33 مرة من أحب الأعمال إلى الله.',
]

/* ─── quick-access cards ─── */
const quickLinks = [
  {
    to: '/prayer-times',
    title: 'مواقيت الصلاة',
    desc: 'أوقات الصلاة لمدينتك',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    to: '/quran',
    title: 'القرآن الكريم',
    desc: 'اقرأ واستمع لكلام الله',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    to: '/athkar',
    title: 'الأذكار',
    desc: 'أذكار الصباح والمساء',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
      </svg>
    ),
  },
  {
    to: '/qibla',
    title: 'اتجاه القبلة',
    desc: 'البوصلة لاتجاه القبلة',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m6 12 6-9 6 9-6 9-6-9Z" />
      </svg>
    ),
  },
  {
    to: '/tasbih',
    title: 'عداد التسبيح',
    desc: 'سبّح واذكر الله',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    to: '/settings',
    title: 'الإعدادات',
    desc: 'تخصيص تجربتك',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
  },
]

/* ─── helper: pick item by day-of-year ─── */
const pickByDay = (arr) => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now - start) / 86_400_000)
  return arr[dayOfYear % arr.length]
}

/* ════════════════════════════════════════════
   HomePage Component
   ════════════════════════════════════════════ */
const HomePage = () => {
  useDocTitle(null) // default: نُور — رفيقك الإسلامي اليومي
  const dailyAyah = useMemo(() => pickByDay(dailyAyahs), [])
  const dailyTip = useMemo(() => pickByDay(dailyTips), [])

  const defaultCity = useMemo(() => getSmartFallbackCity(), [])
  const { location: globalLocation } = useLocation()

  /* ── Build prayer params from global location ── */
  const prayerParams = useMemo(() => {
    if (!globalLocation) return { mode: 'city', city: defaultCity }

    if (globalLocation.mode === 'gps') {
      return {
        mode: 'coordinates',
        latitude: globalLocation.latitude,
        longitude: globalLocation.longitude,
        placeLabel: globalLocation.label,
      }
    }

    return { mode: 'city', city: globalLocation.city || defaultCity }
  }, [globalLocation, defaultCity])

  /* ── prayer times mini-widget ── */
  const { data: prayerData } = useQuery({
    queryKey: ['prayer-times-home', prayerParams],
    queryFn: async () => {
      if (prayerParams.mode === 'coordinates') {
        return fetchPrayerTimesByCoordinates({
          latitude: prayerParams.latitude,
          longitude: prayerParams.longitude,
          placeLabel: prayerParams.placeLabel,
        })
      }
      return fetchPrayerTimesBySmartPlace(prayerParams.city)
    },
    staleTime: 1000 * 60 * 30,
  })

  const prayers = useMemo(
    () => prayerData?.prayers ?? getPrayerTimesFallback(defaultCity).prayers,
    [prayerData, defaultCity],
  )
  const countdown = useNextPrayerCountdown(prayers)

  /* ── tasbih mini counter ── */
  const [tasbihCount, setTasbihCount] = useState(() => {
    const saved = localStorage.getItem('tasbih-home')
    return saved ? Number(saved) : 0
  })

  useEffect(() => {
    localStorage.setItem('tasbih-home', String(tasbihCount))
  }, [tasbihCount])

  /* ── last-read bookmark ── */
  const lastRead = useMemo(() => {
    try {
      const raw = localStorage.getItem('quran-last-read')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }, [])

  return (
    <section className="space-y-6">
      {/* ── Hero ── */}
      <AppSectionTitle
        title="مرحبًا بك في نُور"
        subtitle="رفيقك الإسلامي اليومي — صلاة، قرآن، أذكار وأكثر"
      />

      {/* ── Row 1: Prayer Countdown + Daily Ayah ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Prayer Countdown Card */}
        <AppCard className="relative overflow-hidden p-5" elevated>
          <div className="absolute -left-6 -top-6 h-28 w-28 rounded-full bg-gold-500/10 blur-2xl" />
          <AppBadge tone="gold">الصلاة القادمة</AppBadge>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-3xl font-bold text-gold-300">
                <span className="inline-flex h-9 w-9 items-center justify-center text-gold-400">
                  {prayerIcons[countdown.nextPrayer]}
                </span>
                {prayerNameAr[countdown.nextPrayer] ?? countdown.nextPrayer}
              </p>
              <p className="mt-1 text-sm text-textMuted">
                بعد <span className="font-semibold text-slate-100">{countdown.remaining}</span>
              </p>
            </div>
            {/* Progress percentage */}
            <span className="text-xs font-bold tabular-nums text-gold-400/80" dir="ltr">
              {Math.round(countdown.progress * 100)}%
            </span>
          </div>

          {/* ── Progress bar ── */}
          <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="absolute inset-y-0 start-0 rounded-full bg-gradient-to-l from-gold-400 via-gold-500 to-gold-600 transition-all duration-700 ease-out"
              style={{ width: `${Math.max(2, countdown.progress * 100)}%` }}
            >
              {/* Pulse dot at leading edge */}
              <span className="absolute inset-y-0 end-0 flex items-center">
                <span className="relative flex h-3 w-3 -translate-x-0.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400/50" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-gold-300 shadow-[0_0_8px_rgba(215,169,62,0.6)]" />
                </span>
              </span>
            </div>
          </div>

          {/* Mini prayer bar */}
          <div className="mt-3 flex flex-wrap gap-2">
            {prayers.map((p) => (
              <span
                key={p.name}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${p.name === countdown.nextPrayer
                  ? 'bg-gold-500/20 text-gold-300 ring-1 ring-gold-500/40'
                  : 'bg-surface-soft text-textMuted'
                  }`}
              >
                {prayerNameAr[p.name]} {p.time}
              </span>
            ))}
          </div>

          <Link
            to="/prayer-times"
            className="mt-3 inline-block text-xs font-medium text-gold-400 hover:text-gold-300 transition"
          >
            عرض كل المواقيت ←
          </Link>
        </AppCard>

        {/* Daily Ayah Card */}
        <AppCard className="flex flex-col justify-between p-5" elevated>
          <div>
            <AppBadge tone="gold">آية اليوم</AppBadge>
            <p
              className="mt-4 text-center font-['Amiri',serif] text-2xl leading-relaxed text-slate-100 sm:text-3xl"
              dir="rtl"
            >
              ﴿ {dailyAyah.text} ﴾
            </p>
          </div>
          <p className="mt-3 text-center text-xs text-textMuted">{dailyAyah.ref}</p>
        </AppCard>
      </div>

      {/* ── Row 2: Quick Navigation Grid ── */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-100">الوصول السريع</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {quickLinks.map((item) => (
            <Link key={item.to} to={item.to} className="group">
              <AppCard className="flex flex-col items-center gap-2 p-4 text-center transition group-hover:border-gold-500/50 group-hover:bg-surface/80">
                <span className="text-gold-400 transition group-hover:scale-110">
                  {item.icon}
                </span>
                <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                <p className="text-[11px] leading-tight text-textMuted">{item.desc}</p>
              </AppCard>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Row 3: Tasbih Mini + Last Read + Daily Tip ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Tasbih Mini Counter */}
        <AppCard className="flex flex-col items-center gap-3 p-5 text-center">
          <AppBadge tone="gold">تسبيح سريع</AppBadge>
          <button
            type="button"
            onClick={() => setTasbihCount((c) => c + 1)}
            className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-gold-500/40 bg-gold-500/10 text-3xl font-bold text-gold-300 transition hover:bg-gold-500/20 hover:scale-105 active:scale-95"
            aria-label="اضغط للتسبيح"
          >
            {tasbihCount}
          </button>
          <p className="text-xs text-textMuted">سُبْحَانَ اللهِ</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTasbihCount(0)}
              className="rounded-lg bg-surface-soft px-3 py-1 text-xs text-textMuted hover:text-slate-100 transition"
            >
              إعادة
            </button>
            <Link
              to="/tasbih"
              className="rounded-lg bg-surface-soft px-3 py-1 text-xs text-textMuted hover:text-gold-300 transition"
            >
              العداد الكامل
            </Link>
          </div>
        </AppCard>

        {/* Last Read Quran */}
        <AppCard className="flex flex-col justify-between p-5">
          <div>
            <AppBadge tone="neutral">آخر قراءة</AppBadge>
            {lastRead ? (
              <div className="mt-3">
                <p className="text-lg font-semibold text-slate-100">
                  سورة {lastRead.surahName || `رقم ${lastRead.surahNumber}`}
                </p>
                <p className="mt-1 text-xs text-textMuted">
                  الآية {lastRead.ayahNumber ?? '—'}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-textMuted">
                لم تبدأ القراءة بعد. ابدأ رحلتك مع كتاب الله!
              </p>
            )}
          </div>
          <Link
            to={lastRead ? `/surah/${lastRead.surahNumber}` : '/quran'}
            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-gold-400 hover:text-gold-300 transition"
          >
            {lastRead ? 'متابعة القراءة' : 'ابدأ القراءة'} ←
          </Link>
        </AppCard>

        {/* Daily Tip */}
        <AppCard className="flex flex-col justify-between p-5">
          <div>
            <AppBadge tone="success">نصيحة اليوم</AppBadge>
            <p className="mt-3 text-sm leading-relaxed text-slate-200">
              {dailyTip}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-textMuted">
            <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
            <span>تتغير يوميًا</span>
          </div>
        </AppCard>
      </div>

      {/* ── Row 4: Full Prayer Times Bar ── */}
      <AppCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">مواقيت اليوم</h2>
            <p className="mt-0.5 text-[11px] text-textMuted" aria-label="موقع وتاريخ الأذان">
              {prayerData?.city || defaultCity} • {prayerData?.date || new Date().toLocaleDateString()}
            </p>
          </div>
          <Link
            to="/prayer-times"
            className="text-xs text-gold-400 hover:text-gold-300 transition"
          >
            تفاصيل
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {prayers.map((p) => (
            <div
              key={p.name}
              className={`rounded-xl p-3 text-center transition ${p.name === countdown.nextPrayer
                ? 'bg-gold-500/15 ring-1 ring-gold-500/30'
                : 'bg-surface-soft'
                }`}
            >
              <span className={`mx-auto flex h-8 w-8 items-center justify-center ${p.name === countdown.nextPrayer ? 'text-gold-300' : 'text-gold-500/60'}`}>
                {prayerIcons[p.name]}
              </span>
              <p className={`text-xs font-medium ${p.name === countdown.nextPrayer ? 'text-gold-300' : 'text-textMuted'}`}>
                {prayerNameAr[p.name]}
              </p>
              <p className={`text-sm font-semibold ${p.name === countdown.nextPrayer ? 'text-gold-200' : 'text-slate-100'}`}>
                {p.time}
              </p>
            </div>
          ))}
        </div>
      </AppCard>
    </section>
  )
}

export default HomePage
