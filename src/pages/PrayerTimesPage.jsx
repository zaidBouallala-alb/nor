import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import AppBadge from '../components/AppBadge'
import AppButton from '../components/AppButton'
import AppCard from '../components/AppCard'
import AppSectionTitle from '../components/AppSectionTitle'
import { getPrayerTimesFallback } from '../data/prayerTimesSample'
import {
  fetchPrayerTimesByCity,
  fetchPrayerTimesByCoordinates,
  geocodePlace,
} from '../utils/prayerTimesApi'
import useNextPrayerCountdown from '../utils/useNextPrayerCountdown'

const prayerNameAr = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
}

const PrayerTimesPage = () => {
  const [mode, setMode] = useState('city')
  const [city, setCity] = useState('Cairo')
  const [country, setCountry] = useState('Egypt')
  const [place, setPlace] = useState('')
  const [params, setParams] = useState({
    mode: 'city',
    city: 'Cairo',
    country: 'Egypt',
  })
  const [statusText, setStatusText] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['prayer-times', params],
    queryFn: async () => {
      if (params.mode === 'city') {
        return fetchPrayerTimesByCity({
          city: params.city,
          country: params.country,
        })
      }

      if (params.mode === 'place' && params.place) {
        const location = await geocodePlace(params.place)
        return fetchPrayerTimesByCoordinates({
          latitude: location.latitude,
          longitude: location.longitude,
          placeLabel: location.label,
        })
      }

      if (params.mode === 'coordinates') {
        return fetchPrayerTimesByCoordinates({
          latitude: params.latitude,
          longitude: params.longitude,
          placeLabel: params.placeLabel,
        })
      }

      return getPrayerTimesFallback('cairo')
    },
  })

  const orderedPrayers = useMemo(
    () => data?.prayers ?? getPrayerTimesFallback('cairo').prayers,
    [data],
  )

  const countdown = useNextPrayerCountdown(orderedPrayers)

  const handleCitySearch = () => {
    setStatusText('')
    setParams({
      mode: 'city',
      city: city.trim() || 'Cairo',
      country: country.trim() || 'Egypt',
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

  const effectiveData = data ?? getPrayerTimesFallback('cairo')

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
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === 'city'
                ? 'bg-gold-500 text-background'
                : 'bg-surface-soft text-textMuted hover:bg-surface hover:text-slate-100'
            }`}
            aria-pressed={mode === 'city'}
          >
            حسب المدينة
          </button>
          <button
            type="button"
            onClick={() => setMode('place')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === 'place'
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
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="rounded-xl border border-border bg-surface-soft px-3 py-2 text-sm text-slate-100 focus:border-gold-500 focus:outline-none"
              placeholder="المدينة (مثال: Cairo)"
              aria-label="اسم المدينة"
            />
            <input
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="rounded-xl border border-border bg-surface-soft px-3 py-2 text-sm text-slate-100 focus:border-gold-500 focus:outline-none"
              placeholder="الدولة (مثال: Egypt)"
              aria-label="اسم الدولة"
            />
            <AppButton
              onClick={handleCitySearch}
              className="w-full"
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
