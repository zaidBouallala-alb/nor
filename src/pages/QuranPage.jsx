import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AppBadge from '../components/AppBadge'
import AppCard from '../components/AppCard'
import AppSectionTitle from '../components/AppSectionTitle'
import {
  fetchQuranSurahs,
  getCachedSurahCount,
  downloadAllSurahs,
} from '../utils/quranApi'

const arabicNumber = new Intl.NumberFormat('ar')

const QuranPage = () => {
  const [surahs, setSurahs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  // Offline-download state
  const [cachedCount, setCachedCount] = useState(0)
  const [downloading, setDownloading] = useState(false)
  const [dlProgress, setDlProgress] = useState(null) // {available, total, current}
  const abortRef = useRef(null)

  // ── Load surah list ────────────────────────────────────────
  useEffect(() => {
    let mounted = true
    const load = async () => {
      setIsLoading(true)
      setError('')
      try {
        const data = await fetchQuranSurahs()
        if (mounted) setSurahs(data)
      } catch {
        if (mounted) setError('تعذر تحميل بيانات القرآن. حاول مرة أخرى.')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  // ── Count locally-cached surahs on mount ───────────────────
  useEffect(() => {
    setCachedCount(getCachedSurahCount())
  }, [])

  // ── Download all surahs for offline ────────────────────────
  const handleDownloadAll = useCallback(async () => {
    if (downloading) {
      // Cancel
      abortRef.current?.abort()
      setDownloading(false)
      setDlProgress(null)
      return
    }

    const controller = new AbortController()
    abortRef.current = controller
    setDownloading(true)
    setDlProgress({ available: cachedCount, total: 114, current: 0 })

    try {
      const total = await downloadAllSurahs(
        (p) => setDlProgress(p),
        { signal: controller.signal },
      )
      setCachedCount(total)
    } catch {
      /* cancelled or failed */
    } finally {
      setDownloading(false)
      setDlProgress(null)
      setCachedCount(getCachedSurahCount())
    }
  }, [downloading, cachedCount])

  // ── Filter by search ───────────────────────────────────────
  const filtered = search.trim()
    ? surahs.filter(
        (s) =>
          s.nameArabic.includes(search.trim()) ||
          String(s.number) === search.trim(),
      )
    : surahs

  return (
    <section className="space-y-5">
      <AppSectionTitle
        title="القرآن الكريم"
        subtitle="تصفّح السور — يتم حفظ كل سورة تفتحها للقراءة بدون إنترنت"
      />

      {/* ── Toolbar: search + download ──────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن سورة بالاسم أو الرقم..."
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 pr-10 text-sm text-slate-100 placeholder:text-textMuted focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30"
          />
          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>

        {/* Cached badge */}
        <AppBadge tone={cachedCount === 114 ? 'success' : 'neutral'}>
          {arabicNumber.format(cachedCount)} / ١١٤ محفوظة
        </AppBadge>

        {/* Download-all button */}
        <button
          type="button"
          onClick={handleDownloadAll}
          className={[
            'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
            downloading
              ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
              : cachedCount === 114
                ? 'bg-green-500/20 text-green-300'
                : 'bg-gold-500/20 text-gold-300 hover:bg-gold-500/30',
          ].join(' ')}
          disabled={cachedCount === 114 && !downloading}
        >
          {downloading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" />
              </svg>
              إيقاف التحميل
            </>
          ) : cachedCount === 114 ? (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              تم حفظ الكل
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              تحميل الكل للقراءة بدون إنترنت
            </>
          )}
        </button>
      </div>

      {/* ── Download progress bar ──────────────────────────── */}
      {downloading && dlProgress && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-textMuted">
            <span>
              جارٍ تحميل سورة {arabicNumber.format(dlProgress.current)} من {arabicNumber.format(dlProgress.total)}...
            </span>
            <span>{arabicNumber.format(dlProgress.available)} / {arabicNumber.format(dlProgress.total)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-soft">
            <div
              className="h-full rounded-full bg-gold-500 transition-all duration-300"
              style={{ width: `${(dlProgress.available / dlProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ── States ─────────────────────────────────────────── */}
      {isLoading && (
        <p className="text-sm text-textMuted" role="status" aria-live="polite">
          جارٍ تحميل السور...
        </p>
      )}
      {error && <p className="text-sm text-rose-300" role="alert">{error}</p>}

      {!isLoading && !error && filtered.length === 0 && (
        <p className="text-sm text-textMuted">
          {search.trim() ? 'لا توجد نتائج.' : 'لا توجد بيانات متاحة حاليًا.'}
        </p>
      )}

      {/* ── Surah grid ─────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((surah) => (
          <Link
            key={surah.number}
            to={`/surah/${surah.number}`}
            className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-border/60 bg-surface-glass p-4 shadow-soft backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-gold-500/40 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label={`فتح سورة ${surah.nameArabic}`}
          >
            {/* Number ornament */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-500/10 text-lg font-bold text-gold-400 transition-colors group-hover:bg-gold-500/20">
              {arabicNumber.format(surah.number)}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-bold leading-tight text-slate-100 group-hover:text-gold-300 transition-colors">
                {surah.nameArabic}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-textMuted">
                <span>{surah.revelationPlace}</span>
                <span className="text-border">•</span>
                <span>{arabicNumber.format(surah.ayahCount)} آية</span>
              </div>
            </div>

            {/* Arrow */}
            <svg
              className="h-4 w-4 shrink-0 text-textMuted/40 transition-transform group-hover:translate-x-[-3px] group-hover:text-gold-400"
              fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default QuranPage
