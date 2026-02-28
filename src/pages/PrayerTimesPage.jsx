import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import AppBadge from '../components/AppBadge'
import AppButton from '../components/AppButton'
import AppCard from '../components/AppCard'
import AppSectionTitle from '../components/AppSectionTitle'
import { getPrayerTimesFallback } from '../data/prayerTimesSample'
import usePrayerNotifications from '../hooks/usePrayerNotifications'
import {
  fetchPrayerTimesByCity,
  fetchPrayerTimesByCoordinates,
  fetchPrayerTimesBySmartPlace,
  getSmartFallbackCity,
} from '../utils/prayerTimesApi'
import useNextPrayerCountdown from '../hooks/useNextPrayerCountdown'

const prayerNameAr = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
}

const PrayerTimesPage = () => {
  const defaultCity = getSmartFallbackCity()
  const [mode, setMode] = useState('city')
  const [city, setCity] = useState(defaultCity)
  const [place, setPlace] = useState('')
  const [params, setParams] = useState({
    mode: 'city',
    city: defaultCity,
  })
  const [statusText, setStatusText] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['prayer-times', params],
    queryFn: async () => {
      if (params.mode === 'city') {
        return fetchPrayerTimesByCity({
          city: params.city,
          country: '',
        })
      }

      if (params.mode === 'place' && params.place) {
        return fetchPrayerTimesBySmartPlace(params.place)
      }

      if (params.mode === 'coordinates') {
        return fetchPrayerTimesByCoordinates({
          latitude: params.latitude,
          longitude: params.longitude,
          placeLabel: params.placeLabel,
        })
      }

      return getPrayerTimesFallback(defaultCity)
    },
  })

  const orderedPrayers = useMemo(
    () => data?.prayers ?? getPrayerTimesFallback(defaultCity).prayers,
    [data, defaultCity],
  )

  const countdown = useNextPrayerCountdown(orderedPrayers)
  const notif = usePrayerNotifications(orderedPrayers)

  const handleCitySearch = () => {
    setStatusText('')
    setParams({
      mode: 'city',
      city: city.trim() || 'Casablanca',
    })
  }

  const handlePlaceSearch = () => {
    if (!place.trim()) {
      setStatusText('يرجى كتابة اسم المكان أولاً.')
      return
    }

    setStatusText('')
    setParams({
      mode: 'place',
      place: place.trim(),
    })
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setStatusText('المتصفح لا يدعم تحديد الموقع الجغرافي.')
      return
    }

    setStatusText('جارٍ تحديد موقعك...')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatusText('تم العثور على الموقع. جارٍ تحديث المواقيت...')
        setParams({
          mode: 'coordinates',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          placeLabel: 'موقعي الحالي',
        })
      },
      () => {
        setStatusText('تعذر الوصول للموقع. استخدم البحث بالمدينة أو المكان.')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const effectiveData = data ?? getPrayerTimesFallback(defaultCity)

  if (isLoading) {
    return (
      <p className="text-sm text-textMuted" role="status" aria-live="polite">
        جارٍ تحميل مواقيت الصلاة...
      </p>
    )
  }

  return (
    <section className="space-y-5">
      <AppSectionTitle
        title="مواقيت الصلاة"
        subtitle="احصل على المواقيت حسب المدينة أو المكان أو الموقع الحالي"
      />

      <AppCard className="p-4">
        <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="طرق البحث">
          <button
            type="button"
            onClick={() => setMode('city')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${mode === 'city' || mode === 'auto'
              ? 'bg-gold-500 text-background'
              : 'bg-surface-soft text-textMuted hover:bg-surface hover:text-slate-100'
              }`}
            aria-pressed={mode === 'city' || mode === 'auto'}
          >
            حسب المدينة
          </button>
          <button
            type="button"
            onClick={() => setMode('place')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${mode === 'place'
              ? 'bg-gold-500 text-background'
              : 'bg-surface-soft text-textMuted hover:bg-surface hover:text-slate-100'
              }`}
            aria-pressed={mode === 'place'}
          >
            حسب المكان
          </button>
          <AppButton
            onClick={handleUseMyLocation}
            variant="ghost"
            className="px-3"
          >
            استخدم موقعي
          </AppButton>
        </div>

        {mode === 'city' ? (
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="rounded-xl border border-border bg-surface-soft px-3 py-2 text-sm text-slate-100 focus:border-gold-500 focus:outline-none"
              placeholder="المدينة (مثال: Casablanca)"
              aria-label="اسم المدينة"
            />
            <AppButton
              onClick={handleCitySearch}
            >
              عرض المواقيت
            </AppButton>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              value={place}
              onChange={(event) => setPlace(event.target.value)}
              className="rounded-xl border border-border bg-surface-soft px-3 py-2 text-sm text-slate-100 focus:border-gold-500 focus:outline-none"
              placeholder="المكان (مثال: Istanbul, Turkey)"
              aria-label="اسم المكان"
            />
            <AppButton
              onClick={handlePlaceSearch}
            >
              بحث
            </AppButton>
          </div>
        )}

        {statusText && (
          <p className="mt-3 text-xs text-textMuted" aria-live="polite">
            {statusText}
          </p>
        )}
      </AppCard>

      <p className="text-sm text-textMuted">
        {effectiveData.city} • {effectiveData.date}
      </p>

      <AppCard className="space-y-2 p-4" elevated>
        <AppBadge tone="gold">الوقت المتبقي</AppBadge>
        <p className="text-sm text-slate-100">
          الصلاة القادمة: <span className="font-semibold">{prayerNameAr[countdown.nextPrayer] ?? countdown.nextPrayer}</span> بعد{' '}
          <span className="font-semibold text-gold-300">{countdown.remaining}</span>
        </p>
      </AppCard>

      {/* ── Notifications toggle ──────────────────────────── */}
      <AppCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
            <span className="text-sm font-semibold text-slate-100">تنبيهات الصلاة</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notif.enabled}
            onClick={() => notif.setEnabled(!notif.enabled)}
            className={[
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
              notif.enabled ? 'bg-gold-500' : 'bg-surface-soft',
            ].join(' ')}
          >
            <span
              className={[
                'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
                notif.enabled ? '-translate-x-5' : 'translate-x-0',
              ].join(' ')}
            />
          </button>
        </div>

        {notif.permissionStatus === 'denied' && (
          <p className="mt-2 text-xs text-rose-300">
            ⚠️ تم رفض إذن التنبيهات. فعّلها من إعدادات المتصفح.
          </p>
        )}

        {notif.enabled && notif.permissionStatus === 'granted' && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-border/40 pt-3">
            {notif.notifiablePrayers.map((pName) => (
              <button
                key={pName}
                type="button"
                onClick={() => notif.togglePrayer(pName)}
                className={[
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                  notif.perPrayer[pName]
                    ? 'bg-gold-500/20 text-gold-300 ring-1 ring-gold-500/40'
                    : 'bg-surface-soft text-textMuted hover:text-slate-200',
                ].join(' ')}
              >
                {notif.perPrayer[pName] ? '🔔' : '🔕'} {notif.prayerNamesAr[pName]}
              </button>
            ))}
          </div>
        )}
      </AppCard>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {orderedPrayers.map((prayer) => (
          <AppCard
            as="article"
            key={prayer.name}
            className="space-y-1 p-4"
          >
            <p className="text-sm text-textMuted">{prayerNameAr[prayer.name] ?? prayer.name}</p>
            <p className="text-xl font-semibold text-slate-100">{prayer.time}</p>
          </AppCard>
        ))}
      </div>
    </section>
  )
}

export default PrayerTimesPage
