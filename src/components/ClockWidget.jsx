import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { reverseGeocode } from '../utils/prayerTimesApi'

/* ─── constants ─── */
const LOCATION_CACHE_KEY = 'clock-widget-location-v1'
const LOCATION_MAX_AGE = 1000 * 60 * 60 * 3
const AR_LOCALE_LATN = 'ar-EG-u-nu-latn'
const AR_SA_HIJRI_LATN = 'ar-SA-u-ca-islamic-umalqura-nu-latn'
const AR_MA_HIJRI_LATN = 'ar-MA-u-ca-islamic-nu-latn'

const isMoroccoLocation = ({ country = '', timezone = '' } = {}) => {
  const normalizedCountry = String(country).toLowerCase()
  const normalizedTz = String(timezone).toLowerCase()

  return (
    normalizedCountry.includes('المغرب')
    || normalizedCountry.includes('morocco')
    || normalizedCountry.includes('maroc')
    || normalizedTz.includes('casablanca')
  )
}

const getBrowserTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''
  } catch {
    return ''
  }
}

/* ─── Hijri date via Intl (country-aware) ─── */
const getHijriParts = (date, options = {}) => {
  const morocco = isMoroccoLocation(options)
  const locale = morocco ? AR_MA_HIJRI_LATN : AR_SA_HIJRI_LATN
  const sourceDate = morocco
    ? new Date(date.getTime() - 24 * 60 * 60 * 1000)
    : date

  try {
    const full = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(sourceDate)
    return full
  } catch {
    return ''
  }
}

/* ─── Get greeting ─── */
const getGreeting = (hour) => {
  if (hour >= 3 && hour < 12) return 'صباح الخير'
  if (hour >= 12 && hour < 17) return 'مساء النور'
  if (hour >= 17 && hour < 21) return 'مساء الخير'
  return 'طابت ليلتك'
}

/* ─── localStorage helpers ─── */
const getCachedLocation = () => {
  try {
    const raw = localStorage.getItem(LOCATION_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.ts > LOCATION_MAX_AGE) return null
    return parsed
  } catch {
    return null
  }
}

const cacheLocation = (data) => {
  try {
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({ ...data, ts: Date.now() }))
  } catch {
    /* silent */
  }
}

/* ═══════════════════════════════════════════════════════
   ClockWidget — Full-Width Smart Status Bar
   Always visible. Responsive. Dynamic location + time.
   ═══════════════════════════════════════════════════════ */
const ClockWidget = () => {
  const [now, setNow] = useState(() => new Date())
  const [location, setLocation] = useState(() => getCachedLocation())
  const [locLoading, setLocLoading] = useState(false)
  const geoAttempted = useRef(false)

  /* ── tick ── */
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  /* ── auto-detect location ── */
  const detectLocation = useCallback(async () => {
    if (locLoading) return
    setLocLoading(true)
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: LOCATION_MAX_AGE,
        }),
      )
      const { latitude, longitude } = pos.coords
      const geo = await reverseGeocode(latitude, longitude)
      const loc = {
        city: geo?.city || 'غير محدد',
        country: geo?.country || '',
        lat: latitude,
        lon: longitude,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }
      setLocation(loc)
      cacheLocation(loc)
    } catch {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      const fallbackCity = tz.split('/').pop().replace(/_/g, ' ')
      setLocation({ city: fallbackCity, country: '', tz })
      cacheLocation({ city: fallbackCity, country: '', tz })
    } finally {
      setLocLoading(false)
    }
  }, [locLoading])

  useEffect(() => {
    if (geoAttempted.current) return
    geoAttempted.current = true
    if (!location) detectLocation()
  }, [location, detectLocation])

  /* ── derived ── */
  const seconds = Math.floor(now.getTime() / 1000)

  const timeText = useMemo(
    () =>
      now.toLocaleTimeString(AR_LOCALE_LATN, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seconds],
  )

  const timeShort = useMemo(
    () =>
      now.toLocaleTimeString(AR_LOCALE_LATN, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Math.floor(seconds / 60)],
  )

  const gregorianFull = useMemo(
    () =>
      now.toLocaleDateString(AR_LOCALE_LATN, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [now.toDateString()],
  )

  const gregorianShort = useMemo(
    () =>
      now.toLocaleDateString(AR_LOCALE_LATN, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [now.toDateString()],
  )

  const dayKey = now.toDateString()
  const countryKey = location?.country ?? ''
  const timezoneKey = location?.tz ?? getBrowserTimeZone()

  const hijriDate = useMemo(
    () => getHijriParts(new Date(dayKey), { country: countryKey, timezone: timezoneKey }),
    [dayKey, countryKey, timezoneKey],
  )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const greeting = useMemo(() => getGreeting(now.getHours()), [Math.floor(seconds / 3600)])

  const cityLabel = location?.city || '…'
  const countryLabel = location?.country || ''

  return (
    <section
      aria-label="شريط الحالة الذكي"
      className="
        w-full
        bg-gradient-to-l from-[#080e28] via-[#0c1333]/95 to-[#080e28]
        border-b border-gold-500/15
      "
    >
      {/* ─── Desktop / Tablet (md+) ─── */}
      <div className="hidden md:flex items-center justify-between gap-2 px-4 py-2.5 lg:px-6">
        {/* Left group: Time + Greeting */}
        <div className="flex items-center gap-4">
          {/* Big live clock */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500/10 ring-1 ring-gold-500/20">
              <svg className="h-5 w-5 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400/80">مباشر</span>
              </div>
              <span
                className="font-mono text-2xl font-extrabold leading-none tracking-wider text-white"
                dir="ltr"
              >
                {timeText}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-10 w-px bg-gradient-to-b from-transparent via-gold-500/25 to-transparent" />

          {/* Greeting */}
          <span className="text-base font-semibold text-gold-300/90">{greeting}</span>
        </div>

        {/* Center group: Dates */}
        <div className="flex items-center gap-4">
          {/* Gregorian */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-soft/80 ring-1 ring-border/50">
              <svg className="h-4 w-4 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-medium text-textMuted/60">الميلادي</span>
              <span className="text-sm font-semibold text-slate-200">{gregorianFull}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-border/40" />

          {/* Hijri */}
          {hijriDate && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/8 ring-1 ring-gold-500/20">
                <svg className="h-4 w-4 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-medium text-textMuted/60">الهجري</span>
                <span className="text-sm font-semibold text-gold-300">{hijriDate}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right group: Location */}
        <button
          type="button"
          onClick={detectLocation}
          title="تحديث الموقع"
          className="
            group flex items-center gap-2.5 rounded-xl px-3 py-2
            transition-all hover:bg-surface-soft/60
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400
          "
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-soft/80 ring-1 ring-border/50 transition-colors group-hover:bg-gold-500/15 group-hover:ring-gold-500/30">
            {locLoading ? (
              <svg className="h-4 w-4 animate-spin text-gold-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            )}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-medium text-textMuted/60 group-hover:text-textMuted">الموقع</span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-200 transition-colors group-hover:text-gold-300">
              {cityLabel}
              {countryLabel && <span className="text-[11px] font-normal text-textMuted/60">• {countryLabel}</span>}
            </span>
          </div>
        </button>
      </div>

      {/* ─── Mobile (< md) ─── */}
      <div className="flex md:hidden items-center justify-between px-3 py-2">
        {/* Time — big and prominent */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10 ring-1 ring-gold-500/20">
            <svg className="h-4 w-4 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-emerald-400/70">مباشر</span>
            </div>
            <span className="font-mono text-lg font-extrabold leading-none tracking-wider text-white" dir="ltr">
              {timeShort}
            </span>
          </div>
        </div>

        {/* Date — short format */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-slate-300">{gregorianShort}</span>
          {hijriDate && <span className="text-[11px] font-semibold text-gold-300/80">{hijriDate}</span>}
        </div>

        {/* Location — compact */}
        <button
          type="button"
          onClick={detectLocation}
          className="
            group flex items-center gap-1.5 rounded-lg px-2 py-1.5
            transition hover:bg-surface-soft/50
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400
          "
        >
          {locLoading ? (
            <svg className="h-4 w-4 animate-spin text-gold-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          )}
          <span className="text-xs font-semibold text-slate-300 group-hover:text-gold-300">{cityLabel}</span>
        </button>
      </div>
    </section>
  )
}

export default ClockWidget
