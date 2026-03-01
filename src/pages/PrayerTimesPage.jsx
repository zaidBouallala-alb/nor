import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import AppBadge from '../components/AppBadge'
import AppCard from '../components/AppCard'
import AppSectionTitle from '../components/AppSectionTitle'
import { getPrayerTimesFallback } from '../data/prayerTimesSample'
import usePrayerNotifications from '../hooks/usePrayerNotifications'
import {
  fetchPrayerTimesByCoordinates,
  fetchPrayerTimesBySmartPlace,
  getSmartFallbackCity,
} from '../utils/prayerTimesApi'
import useNextPrayerCountdown from '../hooks/useNextPrayerCountdown'
import { useLocation } from '../context/LocationContext'
import useDocTitle from '../hooks/useDocTitle'

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
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  ),
  Sunrise: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  ),
  Dhuhr: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  ),
  Asr: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 19.5h20" />
    </svg>
  ),
  Maghrib: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 17h18" />
    </svg>
  ),
  Isha: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  ),
}

const PrayerTimesPage = () => {
  useDocTitle('مواقيت الصلاة')
  const defaultCity = getSmartFallbackCity()
  const { location: globalLocation, loading: locationLoading, detectLocation } = useLocation()

  const [searchText, setSearchText] = useState('')
  const [statusText, setStatusText] = useState('')
  const [manualParams, setManualParams] = useState(null) // null = use global location

  // Fill searchText when global location is ready
  const displayedLocation = manualParams
    ? (manualParams.query || manualParams.placeLabel || defaultCity)
    : (globalLocation?.label || defaultCity)

  /* ── Build query params from global location or manual search ── */
  const params = useMemo(() => {
    if (manualParams) return manualParams

    if (!globalLocation) return { mode: 'smart', query: defaultCity }

    if (globalLocation.mode === 'gps') {
      return {
        mode: 'coordinates',
        latitude: globalLocation.latitude,
        longitude: globalLocation.longitude,
        placeLabel: globalLocation.label,
      }
    }

    return { mode: 'smart', query: globalLocation.city || defaultCity }
  }, [manualParams, globalLocation, defaultCity])

  /* ── Fetch prayer times ── */
  const { data, isLoading } = useQuery({
    queryKey: ['prayer-times', params],
    queryFn: async () => {
      if (params.mode === 'coordinates') {
        return fetchPrayerTimesByCoordinates({
          latitude: params.latitude,
          longitude: params.longitude,
          placeLabel: params.placeLabel,
        })
      }
      if (params.mode === 'smart' && params.query) {
        return fetchPrayerTimesBySmartPlace(params.query)
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

  /* ── Handlers ── */
  const handleSearch = useCallback(() => {
    const query = searchText.trim()
    if (!query) {
      setStatusText('يرجى كتابة اسم المدينة أو المنطقة.')
      return
    }
    setStatusText('')
    setManualParams({ mode: 'smart', query })
  }, [searchText])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleUseMyLocation = useCallback(() => {
    setStatusText('')
    setManualParams(null) // Reset to global location
    detectLocation() // Re-trigger GPS detection
  }, [detectLocation])

  const effectiveData = data ?? getPrayerTimesFallback(defaultCity)

  /* ── Loading state ── */
  if (locationLoading) {
    return (
      <section className="space-y-5">
        <AppSectionTitle
          title="مواقيت الصلاة"
          subtitle="جارٍ تحديد موقعك لعرض المواقيت الدقيقة..."
        />
        <AppCard className="flex flex-col items-center gap-4 p-8" elevated>
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold-500/30 border-t-gold-500" />
          <p className="text-sm text-textMuted">جارٍ تحديد الموقع...</p>
        </AppCard>
      </section>
    )
  }

  return (
    <section className="space-y-5">
      <AppSectionTitle
        title="مواقيت الصلاة"
        subtitle="ابحث بالمدينة أو المنطقة أو استخدم موقعك الحالي"
      />

      {/* ── Search Card ── */}
      <AppCard className="p-4">
        <div className="flex gap-2">
          {/* GPS location button */}
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold-500/40 bg-gold-500/10 text-gold-400 transition hover:bg-gold-500/20"
            aria-label="تحديد موقعي"
            title="تحديد موقعي"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          </button>

          {/* Single smart search input */}
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-w-0 flex-1 rounded-xl border border-border bg-surface-soft px-4 py-2 text-sm text-slate-100 placeholder:text-textMuted/60 focus:border-gold-500 focus:outline-none"
            placeholder={displayedLocation || 'المدينة أو المنطقة...'}
            aria-label="البحث بالمدينة أو المنطقة"
          />

          {/* Search button */}
          <button
            type="button"
            onClick={handleSearch}
            className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-gold-500 px-4 text-sm font-semibold text-background transition hover:bg-gold-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            بحث
          </button>
        </div>

        {statusText && (
          <p className="mt-3 text-xs text-textMuted" aria-live="polite">{statusText}</p>
        )}
      </AppCard>

      {/* ── Location & Date ── */}
      <div className="flex items-center gap-2 text-sm text-textMuted">
        <svg className="h-4 w-4 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
        <span>{effectiveData.city} • {effectiveData.date}</span>
      </div>

      {/* ── Next Prayer Countdown ── */}
      {isLoading ? (
        <AppCard className="p-4" elevated>
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-500" />
            <span className="text-sm text-textMuted">جارٍ تحديث المواقيت...</span>
          </div>
        </AppCard>
      ) : (
        <AppCard className="space-y-3 p-5" elevated>
          <div className="flex items-start justify-between">
            <AppBadge tone="gold">الوقت المتبقي</AppBadge>
            <span className="text-xs font-bold tabular-nums text-gold-400/80" dir="ltr">
              {Math.round(countdown.progress * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400 ring-1 ring-gold-500/20">
              {prayerIcons[countdown.nextPrayer]}
            </span>
            <div>
              <p className="text-lg font-bold text-gold-300">
                {prayerNameAr[countdown.nextPrayer] ?? countdown.nextPrayer}
              </p>
              <p className="text-xs text-textMuted">
                بعد <span className="font-semibold text-slate-200">{countdown.remaining}</span>
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="absolute inset-y-0 start-0 rounded-full bg-gradient-to-l from-gold-400 via-gold-500 to-gold-600 transition-all duration-700 ease-out"
              style={{ width: `${Math.max(2, countdown.progress * 100)}%` }}
            >
              <span className="absolute inset-y-0 end-0 flex items-center">
                <span className="relative flex h-3 w-3 -translate-x-0.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400/50" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-gold-300 shadow-[0_0_8px_rgba(215,169,62,0.6)]" />
                </span>
              </span>
            </div>
          </div>
        </AppCard>
      )}

      {/* ── Notifications ── */}
      <AppCard className="p-5" elevated>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400 ring-1 ring-gold-500/20">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-bold text-slate-100">تنبيهات الصلاة</p>
              <p className="text-xs text-textMuted">
                {notif.enabled ? 'مفعّلة — ستصلك تنبيهات قبل كل صلاة' : 'معطّلة'}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            dir="ltr"
            aria-checked={notif.enabled}
            onClick={() => notif.setEnabled(!notif.enabled)}
            className={[
              'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              notif.enabled ? 'bg-gold-500/40' : 'bg-white/10',
            ].join(' ')}
          >
            <span
              className={[
                'pointer-events-none inline-block h-4 w-4 rounded-full shadow transition-transform duration-200',
                notif.enabled
                  ? 'translate-x-[1.375rem] bg-gold-400'
                  : 'translate-x-1 bg-slate-400',
              ].join(' ')}
            />
          </button>
        </div>

        {notif.permissionStatus === 'denied' && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            تم رفض إذن التنبيهات. فعّلها من إعدادات المتصفح.
          </div>
        )}

        {notif.enabled && notif.permissionStatus === 'granted' && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {notif.notifiablePrayers.map((pName) => {
              const isOn = notif.perPrayer[pName]
              return (
                <button
                  key={pName}
                  type="button"
                  onClick={() => notif.togglePrayer(pName)}
                  className={[
                    'flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                    isOn
                      ? 'border-gold-500/40 bg-gold-500/15 text-gold-300'
                      : 'border-border/50 bg-surface-soft/30 text-textMuted hover:border-border hover:text-slate-300',
                  ].join(' ')}
                >
                  <svg
                    className={['h-4 w-4 transition-colors', isOn ? 'text-gold-400' : 'text-textMuted/50'].join(' ')}
                    fill={isOn ? 'currentColor' : 'none'}
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                  </svg>
                  {notif.prayerNamesAr[pName]}
                </button>
              )
            })}
          </div>
        )}
      </AppCard>

      {/* ── Prayer Times Grid ── */}
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
