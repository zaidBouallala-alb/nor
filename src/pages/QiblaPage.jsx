import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AppBadge from '../components/AppBadge'
import AppCard from '../components/AppCard'
import AppSectionTitle from '../components/AppSectionTitle'
import { calculateQiblaDirection } from '../utils/qiblaUtils'
import { reverseGeocode } from '../utils/prayerTimesApi'

/* ── Kaaba coordinates ── */
const KAABA_LAT = 21.4225
const KAABA_LNG = 39.8262

/* ── Haversine distance (km) ── */
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/* ── Compass direction label ── */
const bearingLabel = (deg) => {
  const dirs = ['شمال', 'شمال شرق', 'شرق', 'جنوب شرق', 'جنوب', 'جنوب غرب', 'غرب', 'شمال غرب']
  return dirs[Math.round(deg / 45) % 8]
}

/* ═══════════════════════════════════════════
   Full SVG Compass Component
   ═══════════════════════════════════════════ */
const Compass = ({ qiblaAngle, deviceHeading, size = 280 }) => {
  const c = size / 2
  const outerR = c - 4
  const innerR = c - 22
  const tickR = c - 10
  const labelR = c - 36
  const needleLen = c - 48

  const labels = [
    { deg: 0, text: 'ش' },
    { deg: 90, text: 'شر' },
    { deg: 180, text: 'ج' },
    { deg: 270, text: 'غ' },
  ]

  const compassRotation = deviceHeading !== null ? -deviceHeading : 0

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* glow backdrop */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(202,138,4,0.08) 0%, transparent 70%)',
        }}
      />

      <svg width={size} height={size} className="relative z-10">
        <defs>
          <linearGradient id="qibla-needle-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
          <filter id="needle-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="compass-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(30,41,59,0.9)" />
            <stop offset="100%" stopColor="rgba(15,23,42,0.95)" />
          </radialGradient>
        </defs>

        {/* outer ring */}
        <circle cx={c} cy={c} r={outerR} fill="none" stroke="rgba(202,138,4,0.3)" strokeWidth="2" />
        <circle cx={c} cy={c} r={outerR - 2} fill="url(#compass-bg)" />

        {/* inner decorative ring */}
        <circle cx={c} cy={c} r={innerR} fill="none" stroke="rgba(202,138,4,0.15)" strokeWidth="1" />

        {/* rotating group: ticks, labels, needle */}
        <g transform={`rotate(${compassRotation} ${c} ${c})`}>
          {/* degree ticks */}
          {Array.from({ length: 72 }, (_, i) => {
            const deg = i * 5
            const isMajor = deg % 90 === 0
            const isMid = deg % 45 === 0
            const len = isMajor ? 12 : isMid ? 8 : 4
            const rad = (deg * Math.PI) / 180
            const x1 = c + (tickR - len) * Math.sin(rad)
            const y1 = c - (tickR - len) * Math.cos(rad)
            const x2 = c + tickR * Math.sin(rad)
            const y2 = c - tickR * Math.cos(rad)
            return (
              <line
                key={deg}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isMajor ? 'rgba(202,138,4,0.8)' : isMid ? 'rgba(202,138,4,0.4)' : 'rgba(148,163,184,0.2)'}
                strokeWidth={isMajor ? 2 : 1}
              />
            )
          })}

          {/* cardinal labels */}
          {labels.map(({ deg, text }) => {
            const rad = (deg * Math.PI) / 180
            const x = c + labelR * Math.sin(rad)
            const y = c - labelR * Math.cos(rad)
            return (
              <text
                key={deg}
                x={x} y={y}
                textAnchor="middle"
                dominantBaseline="central"
                className={`text-xs font-bold ${deg === 0 ? 'fill-gold-400' : 'fill-slate-400'}`}
                style={{ fontSize: deg === 0 ? 14 : 12 }}
              >
                {text}
              </text>
            )
          })}

          {/* Qibla needle */}
          {qiblaAngle !== null && (
            <g transform={`rotate(${qiblaAngle} ${c} ${c})`} filter="url(#needle-glow)">
              {/* needle body */}
              <line
                x1={c} y1={c + 30}
                x2={c} y2={c - needleLen}
                stroke="url(#qibla-needle-g)" strokeWidth="3" strokeLinecap="round"
              />
              {/* arrowhead */}
              <polygon
                points={`${c},${c - needleLen - 6} ${c - 6},${c - needleLen + 8} ${c + 6},${c - needleLen + 8}`}
                fill="#fbbf24"
              />
              {/* Kaaba icon at tip */}
              <rect
                x={c - 5} y={c - needleLen - 18}
                width={10} height={10} rx={1.5}
                fill="#ca8a04" stroke="#fbbf24" strokeWidth="1"
              />
            </g>
          )}
        </g>

        {/* center dot */}
        <circle cx={c} cy={c} r={5} fill="#1e293b" stroke="rgba(202,138,4,0.6)" strokeWidth="2" />
      </svg>
    </div>
  )
}

/* ═══════════════════════════════════════════
   QiblaPage
   ═══════════════════════════════════════════ */
const QiblaPage = () => {
  const [latitude, setLatitude] = useState('30.0444')
  const [longitude, setLongitude] = useState('31.2357')
  const [statusText, setStatusText] = useState('')
  const [locationName, setLocationName] = useState('القاهرة، مصر')
  const [deviceHeading, setDeviceHeading] = useState(null)
  const [compassSupported, setCompassSupported] = useState(false)
  const watchRef = useRef(null)

  const getHeadingFromEvent = useCallback((event) => {
    if (typeof event?.webkitCompassHeading === 'number') {
      return event.webkitCompassHeading
    }

    if (typeof event?.alpha !== 'number') {
      return null
    }

    const screenAngle =
      window.screen?.orientation?.angle
      ?? (typeof window.orientation === 'number' ? window.orientation : 0)

    let heading = 360 - event.alpha
    heading = (heading + screenAngle) % 360
    if (heading < 0) heading += 360

    return heading
  }, [])

  const orientationHandler = useCallback((event) => {
    const heading = getHeadingFromEvent(event)
    if (heading === null) return

    setDeviceHeading(heading)
    setCompassSupported(true)
  }, [getHeadingFromEvent])

  const attachOrientationListeners = useCallback(() => {
    window.addEventListener('deviceorientationabsolute', orientationHandler, true)
    window.addEventListener('deviceorientation', orientationHandler, true)
  }, [orientationHandler])

  const detachOrientationListeners = useCallback(() => {
    window.removeEventListener('deviceorientationabsolute', orientationHandler, true)
    window.removeEventListener('deviceorientation', orientationHandler, true)
  }, [orientationHandler])

  const latNum = Number(latitude)
  const lonNum = Number(longitude)
  const hasInvalidInput = Number.isNaN(latNum) || Number.isNaN(lonNum)

  const direction = useMemo(
    () => (hasInvalidInput ? null : calculateQiblaDirection(latNum, lonNum)),
    [hasInvalidInput, latNum, lonNum],
  )

  const distanceKm = useMemo(
    () => (hasInvalidInput ? null : haversineKm(latNum, lonNum, KAABA_LAT, KAABA_LNG)),
    [hasInvalidInput, latNum, lonNum],
  )

  /* ── Device compass (magnetometer) ── */
  useEffect(() => {
    if (typeof DeviceOrientationEvent !== 'undefined') {
      // iOS 13+ requires permission
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // will be requested on button tap
      } else {
        attachOrientationListeners()
      }
    } else {
      setStatusText('جهازك لا يدعم البوصلة الرقمية. يمكنك الاعتماد على زاوية القبلة بالأرقام.')
    }

    return () => detachOrientationListeners()
  }, [attachOrientationListeners, detachOrientationListeners])

  const requestCompass = useCallback(async () => {
    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
      try {
        setStatusText('جارٍ طلب إذن البوصلة...')
        const perm = await DeviceOrientationEvent.requestPermission()
        if (perm === 'granted') {
          attachOrientationListeners()
          setStatusText('تم تفعيل البوصلة الرقمية بنجاح.')
        } else {
          setStatusText('تم رفض إذن البوصلة. فعّل الإذن من إعدادات المتصفح.')
        }
      } catch {
        setStatusText('تعذر تفعيل البوصلة. تأكد من السماح بإذن الحركة والاتجاه.')
      }
    }
  }, [attachOrientationListeners])

  /* ── Geolocation ── */
  const handleUseMyLocation = useCallback(async () => {
    setStatusText('')

    if (!navigator.geolocation) {
      setStatusText('المتصفح لا يدعم تحديد الموقع.')
      return
    }

    setStatusText('جارٍ تحديد موقعك...')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(4)
        const lon = position.coords.longitude.toFixed(4)
        setLatitude(lat)
        setLongitude(lon)
        setStatusText('تم تحديث الموقع بنجاح.')

        // reverse geocode
        const geo = await reverseGeocode(Number(lat), Number(lon))
        if (geo?.label) setLocationName(geo.label)
      },
      () => {
        setStatusText('تعذر الوصول للموقع. أدخل الإحداثيات يدويًا.')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  const directionStr = direction !== null ? direction.toFixed(2) : '--'
  const distStr = distanceKm !== null ? Math.round(distanceKm).toLocaleString('ar-EG') : '--'

  return (
    <section className="space-y-6">
      <AppSectionTitle
        title="اتجاه القبلة"
        subtitle="حدد موقعك لعرض اتجاه القبلة بدقة مع بوصلة تفاعلية"
      />

      {/* ── Main Compass Card ── */}
      <AppCard className="p-6 sm:p-8" elevated>
        <div className="flex flex-col items-center gap-6">
          {/* location name */}
          {locationName && (
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <span className="text-sm font-medium text-slate-200">{locationName}</span>
            </div>
          )}

          {/* compass */}
          <Compass
            qiblaAngle={direction}
            deviceHeading={deviceHeading}
            size={280}
          />

          {/* compass support badge */}
          {compassSupported ? (
            <AppBadge tone="success">البوصلة الرقمية مفعّلة</AppBadge>
          ) : (
            <AppBadge tone="neutral">أدر جهازك لتفعيل البوصلة</AppBadge>
          )}

          {/* angle display */}
          <div className="text-center">
            <p className="text-xs text-textMuted">زاوية القبلة من الشمال</p>
            <p className="mt-1 text-4xl font-bold tabular-nums text-gold-300">
              {directionStr === '--' ? '--' : `${directionStr}°`}
            </p>
            {direction !== null && (
              <p className="mt-1 text-sm text-textMuted">
                الاتجاه: <span className="font-medium text-slate-200">{bearingLabel(direction)}</span>
              </p>
            )}
          </div>

          {/* action buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleUseMyLocation}
              className="flex items-center gap-2 rounded-xl border border-gold-500/40 bg-gold-500/10 px-5 py-2.5 text-sm font-semibold text-gold-300 transition hover:bg-gold-500/20"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              تحديد موقعي
            </button>
            {!compassSupported && typeof DeviceOrientationEvent?.requestPermission === 'function' && (
              <button
                type="button"
                onClick={requestCompass}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface-soft px-5 py-2.5 text-sm font-medium text-textMuted transition hover:text-slate-100"
              >
                تفعيل البوصلة
              </button>
            )}
          </div>

          {statusText && (
            <p className="text-xs text-textMuted" aria-live="polite">{statusText}</p>
          )}
        </div>
      </AppCard>

      {/* ── Stats Grid ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AppCard className="p-4 text-center">
          <p className="text-xs text-textMuted">الزاوية</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-gold-300">
            {directionStr === '--' ? '--' : `${directionStr}°`}
          </p>
        </AppCard>
        <AppCard className="p-4 text-center">
          <p className="text-xs text-textMuted">الاتجاه</p>
          <p className="mt-1 text-xl font-bold text-slate-100">
            {direction !== null ? bearingLabel(direction) : '--'}
          </p>
        </AppCard>
        <AppCard className="p-4 text-center">
          <p className="text-xs text-textMuted">المسافة للكعبة</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-slate-100">
            {distStr} <span className="text-sm font-normal text-textMuted">كم</span>
          </p>
        </AppCard>
        <AppCard className="p-4 text-center">
          <p className="text-xs text-textMuted">البوصلة</p>
          <p className="mt-1 text-xl font-bold text-slate-100">
            {compassSupported ? (
              <span className="text-emerald-400">مفعّلة</span>
            ) : (
              <span className="text-textMuted">غير متاحة</span>
            )}
          </p>
        </AppCard>
      </div>

      {/* ── Manual Coordinates ── */}
      <AppCard className="p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-100">
          <svg className="h-4 w-4 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          إحداثيات يدوية
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-textMuted">خط العرض (Latitude)</span>
            <input
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-soft px-3 py-2 text-sm tabular-nums text-slate-100 focus:border-gold-500 focus:outline-none"
              type="number"
              step="0.0001"
              inputMode="decimal"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-textMuted">خط الطول (Longitude)</span>
            <input
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-soft px-3 py-2 text-sm tabular-nums text-slate-100 focus:border-gold-500 focus:outline-none"
              type="number"
              step="0.0001"
              inputMode="decimal"
            />
          </label>
        </div>

        {hasInvalidInput && (
          <p className="mt-3 text-sm text-rose-300" role="alert">
            يرجى إدخال قيم رقمية صحيحة.
          </p>
        )}
      </AppCard>

      {/* ── Info Card ── */}
      <AppCard className="space-y-3 p-5">
        <h2 className="text-sm font-semibold text-slate-100">كيف تعمل البوصلة؟</h2>
        <div className="space-y-2 text-xs leading-relaxed text-textMuted">
          <p>
            <span className="font-medium text-gold-300">١.</span> اضغط <strong className="text-slate-200">تحديد موقعي</strong> أو أدخل الإحداثيات يدويًا.
          </p>
          <p>
            <span className="font-medium text-gold-300">٢.</span> يتم حساب الزاوية عبر معادلة <strong className="text-slate-200">Great-circle bearing</strong> إلى الكعبة المشرفة.
          </p>
          <p>
            <span className="font-medium text-gold-300">٣.</span> على الهاتف: البوصلة تدور تلقائيًا مع المستشعر. على الكمبيوتر: السهم يشير للاتجاه الصحيح من الشمال.
          </p>
          <p>
            <span className="font-medium text-gold-300">٤.</span> المربع الذهبي <span className="inline-block h-3 w-3 rounded-sm bg-gold-500" /> في رأس الإبرة يمثل الكعبة المشرفة.
          </p>
        </div>
      </AppCard>
    </section>
  )
}

export default QiblaPage
