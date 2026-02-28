import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AudioPlayer from '../components/AudioPlayer'
import AyahRow from '../components/AyahRow'
import AppBadge from '../components/AppBadge'
import AppButton from '../components/AppButton'
import AppCard from '../components/AppCard'
import useAudioPlayer from '../hooks/useAudioPlayer'
import useLastRead from '../hooks/useLastRead'
import { fetchSurahByNumber } from '../utils/quranApi'

const arabicNum = new Intl.NumberFormat('ar')

// ── Reading-control options ──────────────────────────────────
const FONT_SIZES = [
  { key: 'sm', label: 'صغير', cls: 'text-lg' },
  { key: 'md', label: 'متوسط', cls: 'text-xl' },
  { key: 'lg', label: 'كبير', cls: 'text-3xl' },
]

const LINE_HEIGHTS = [
  { key: 'normal', label: 'عادي', cls: 'leading-relaxed' },
  { key: 'loose', label: 'واسع', cls: 'leading-loose' },
  { key: 'extra', label: 'أوسع', cls: 'leading-[2.8]' },
]

// ── Bismillah (not shown for Al-Fatiha or At-Tawbah) ────────
const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'

// ── Component ────────────────────────────────────────────────
const SurahPage = () => {
  const { number } = useParams()
  const surahNumber = Number(number)

  const [surah, setSurah] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  // Reading controls
  const [fontSize, setFontSize] = useState('md')
  const [lineHeight, setLineHeight] = useState('loose')
  const [nightMode, setNightMode] = useState(false)
  const [showControls, setShowControls] = useState(true)

  // Last-read bookmark
  const { lastReadAyah, saveLastRead } = useLastRead(surahNumber)
  const ayahRefs = useRef({})

  // Audio player
  const audioPlayer = useAudioPlayer(surahNumber)

  // Auto-scroll to currently playing ayah
  useEffect(() => {
    if (audioPlayer.currentAyah && ayahRefs.current[audioPlayer.currentAyah]) {
      ayahRefs.current[audioPlayer.currentAyah].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [audioPlayer.currentAyah])

  // ── Fetch surah ────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true
    if (!Number.isFinite(surahNumber) || surahNumber < 1) {
      setSurah(null)
      setError('تعذر العثور على السورة.')
      setIsLoading(false)
      return undefined
    }

    const loadSurah = async () => {
      setIsLoading(true)
      setError('')
      try {
        const data = await fetchSurahByNumber(surahNumber)
        if (isMounted) setSurah(data)
      } catch {
        if (isMounted) {
          setSurah(null)
          setError('تعذر تحميل السورة. حاول مرة أخرى.')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadSurah()
    return () => { isMounted = false }
  }, [surahNumber, reloadKey])

  // ── Scroll helpers ─────────────────────────────────────────
  const scrollToAyah = useCallback((ayahNum) => {
    const el = ayahRefs.current[ayahNum]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  const handleContinue = useCallback(() => {
    if (lastReadAyah) scrollToAyah(lastReadAyah)
  }, [lastReadAyah, scrollToAyah])

  const handleAyahSelect = useCallback(
    (ayahNum) => saveLastRead(ayahNum),
    [saveLastRead],
  )

  // ── Derived ────────────────────────────────────────────────
  const fontOpt = FONT_SIZES.find((f) => f.key === fontSize) ?? FONT_SIZES[1]
  const lineOpt = LINE_HEIGHTS.find((l) => l.key === lineHeight) ?? LINE_HEIGHTS[1]
  const showBismillah = surahNumber !== 1 && surahNumber !== 9

  // ── Loading state ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-gold-500/30 border-t-gold-500" />
        <p className="text-sm text-textMuted" role="status" aria-live="polite">
          جارٍ تحميل السورة...
        </p>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────
  if (!surah) {
    return (
      <div className="mx-auto max-w-md space-y-5 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10">
          <svg className="h-8 w-8 text-rose-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-sm text-rose-300" role="alert">
          {error || 'تعذر العثور على السورة.'}
        </p>
        <p className="text-xs text-textMuted">
          تأكد من اتصالك بالإنترنت أو حمّل السورة مسبقًا من صفحة القرآن.
        </p>
        <AppButton onClick={() => setReloadKey((k) => k + 1)} variant="secondary">
          إعادة المحاولة
        </AppButton>
      </div>
    )
  }

  // ── Control button helper ──────────────────────────────────
  const CtrlBtn = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
        active
          ? 'bg-gold-500 text-background shadow-sm'
          : 'text-textMuted hover:bg-white/5 hover:text-slate-200',
      ].join(' ')}
    >
      {children}
    </button>
  )

  // ── Main render ────────────────────────────────────────────
  return (
    <section
      className={[
        'mx-auto max-w-3xl space-y-0 transition-colors duration-300',
        nightMode ? 'quran-night' : '',
      ].join(' ')}
    >
      {/* ── Surah header card ────────────────────────────────── */}
      <div
        className={[
          'relative overflow-hidden rounded-t-2xl border border-b-0 border-border/60 px-6 py-8 text-center',
          nightMode
            ? 'bg-gradient-to-b from-[#0a0f20] to-[#0d1529]'
            : 'bg-gradient-to-b from-surface-glass to-surface',
        ].join(' ')}
      >
        {/* Decorative glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(215,169,62,0.06),transparent_70%)]" />

        {/* Back link */}
        <Link
          to="/quran"
          className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-textMuted transition-colors hover:bg-white/5 hover:text-gold-300"
        >
          <svg className="h-3.5 w-3.5 rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          العودة
        </Link>

        {/* Surah number ornament */}
        <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center">
          <svg className="absolute inset-0 h-full w-full text-gold-500/30" viewBox="0 0 100 100">
            <polygon points="50,2 61,38 98,38 68,60 79,96 50,74 21,96 32,60 2,38 39,38" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span className="text-lg font-bold text-gold-300">
            {arabicNum.format(surah.number)}
          </span>
        </div>

        {/* Surah name */}
        <h1 className="mb-2 text-4xl font-bold text-slate-50 sm:text-5xl" style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}>
          سورة {surah.nameArabic}
        </h1>

        {/* Meta badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <AppBadge tone="gold">{surah.revelationPlace}</AppBadge>
          <AppBadge tone="neutral">{arabicNum.format(surah.ayahs.length)} آية</AppBadge>
        </div>

        {/* Continue reading */}
        {lastReadAyah && (
          <button
            type="button"
            onClick={handleContinue}
            className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-gold-500/15 px-4 py-2 text-xs font-semibold text-gold-300 transition-colors hover:bg-gold-500/25"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            متابعة من آية {arabicNum.format(lastReadAyah)}
          </button>
        )}

        {/* Nav arrows */}
        <div className="mt-5 flex items-center justify-center gap-3">
          {surahNumber > 1 && (
            <Link
              to={`/surah/${surahNumber - 1}`}
              className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-textMuted transition-colors hover:bg-white/10 hover:text-gold-300"
            >
              ← السورة السابقة
            </Link>
          )}
          {surahNumber < 114 && (
            <Link
              to={`/surah/${surahNumber + 1}`}
              className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-textMuted transition-colors hover:bg-white/10 hover:text-gold-300"
            >
              السورة التالية →
            </Link>
          )}
        </div>
      </div>

      {/* ── Controls toolbar (collapsible) ───────────────────── */}
      <AppCard
        glass={false}
        className={[
          'sticky top-0 z-20 rounded-none border-x border-border/60 px-4 py-2',
          nightMode ? 'bg-[#0b1025]/95 backdrop-blur-md' : 'bg-surface/95 backdrop-blur-md',
        ].join(' ')}
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowControls((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-textMuted transition-colors hover:text-gold-300"
          >
            <svg className={`h-4 w-4 transition-transform ${showControls ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
            إعدادات القراءة
          </button>

          {/* Quick night toggle */}
          <button
            type="button"
            onClick={() => setNightMode((v) => !v)}
            aria-pressed={nightMode}
            className={[
              'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
              nightMode
                ? 'bg-gold-500/20 text-gold-300'
                : 'text-textMuted hover:text-gold-300',
            ].join(' ')}
          >
            {nightMode ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75 9.75 9.75 0 018.25 6c0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 12c0 5.385 4.365 9.75 9.75 9.75 3.959 0 7.369-2.353 8.911-5.748z" />
              </svg>
            )}
            {nightMode ? 'نهاري' : 'ليلي'}
          </button>
        </div>

        {showControls && (
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/40 pt-3" role="toolbar" aria-label="إعدادات القراءة">
            {/* Font size */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wider text-textMuted/70">الخط</span>
              {FONT_SIZES.map((o) => (
                <CtrlBtn key={o.key} active={fontSize === o.key} onClick={() => setFontSize(o.key)}>
                  {o.label}
                </CtrlBtn>
              ))}
            </div>
          </div>
        )}
      </AppCard>

      {/* ── Bismillah ────────────────────────────────────────── */}
      {showBismillah && (
        <div
          className={[
            'border-x border-border/60 px-6 py-6 text-center',
            nightMode ? 'bg-[#0c1228]' : 'bg-surface/50',
          ].join(' ')}
        >
          <p
            className="text-2xl font-semibold text-gold-400/80 sm:text-3xl"
            style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}
          >
            {BISMILLAH}
          </p>
          <div className="mx-auto mt-3 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-gradient-to-l from-gold-500/40 to-transparent" />
            <span className="text-gold-500/50">✦</span>
            <span className="h-px w-12 bg-gradient-to-r from-gold-500/40 to-transparent" />
          </div>
        </div>
      )}

      {/* ── Continuous ayah text ──────────────────────────────── */}
      <div
        className={[
          'rounded-b-2xl border border-t-0 border-border/60 px-6 py-8 sm:px-10 sm:py-10',
          nightMode ? 'bg-[#090e1e]' : 'bg-surface-glass/30',
        ].join(' ')}
        aria-label="آيات السورة"
      >
        <p
          className={[
            fontOpt.cls,
            lineOpt.cls,
            'text-center font-medium',
            nightMode ? 'text-slate-50' : 'text-slate-100',
          ].join(' ')}
          style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif", wordSpacing: '0.05em' }}
          dir="rtl"
        >
          {surah.ayahs.map((ayah) => (
            <AyahRow
              key={ayah.number}
              ref={(el) => { ayahRefs.current[ayah.number] = el }}
              ayah={ayah}
              isLastRead={ayah.number === lastReadAyah}
              isPlaying={ayah.number === audioPlayer.currentAyah}
              nightMode={nightMode}
              onSelect={handleAyahSelect}
              onPlay={audioPlayer.playAyah}
            />
          ))}
        </p>
      </div>

      {/* ── Bottom nav ───────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 pt-5">
        {surahNumber > 1 ? (
          <Link
            to={`/surah/${surahNumber - 1}`}
            className="inline-flex items-center gap-2 rounded-xl bg-surface-glass px-4 py-2.5 text-sm font-medium text-textMuted transition-colors hover:text-gold-300"
          >
            ← السابقة
          </Link>
        ) : <span />}

        <Link
          to="/quran"
          className="inline-flex items-center gap-2 rounded-xl bg-surface-glass px-4 py-2.5 text-sm font-medium text-textMuted transition-colors hover:text-gold-300"
        >
          فهرس السور
        </Link>

        {surahNumber < 114 ? (
          <Link
            to={`/surah/${surahNumber + 1}`}
            className="inline-flex items-center gap-2 rounded-xl bg-surface-glass px-4 py-2.5 text-sm font-medium text-textMuted transition-colors hover:text-gold-300"
          >
            التالية →
          </Link>
        ) : <span />}
      </div>

      {/* ── Audio Player ───────────────────────────────────── */}
      <AudioPlayer player={audioPlayer} />
    </section>
  )
}

export default SurahPage
