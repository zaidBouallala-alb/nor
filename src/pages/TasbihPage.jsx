import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AppBadge from '../components/AppBadge'
import AppCard from '../components/AppCard'
import AppSectionTitle from '../components/AppSectionTitle'
import useDocTitle from '../hooks/useDocTitle'

/* ─── preset dhikr list ─── */
const PRESETS = [
  { id: 'subhanallah', label: 'سُبْحَانَ اللهِ', target: 33 },
  { id: 'alhamdulillah', label: 'الحَمْدُ لِلّهِ', target: 33 },
  { id: 'allahuakbar', label: 'اللهُ أَكْبَرُ', target: 34 },
  { id: 'lailaha', label: 'لَا إِلٰهَ إِلَّا اللهُ', target: 100 },
  { id: 'istighfar', label: 'أَسْتَغْفِرُ اللهَ', target: 100 },
  { id: 'salawat', label: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', target: 100 },
  { id: 'hawqala', label: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ', target: 100 },
  { id: 'custom', label: 'ذكر مخصص', target: 99 },
]

const STORAGE_KEY = 'tasbih-v2'

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const saveState = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

/* ── circular progress ring ── */
const Ring = ({ progress, size = 220, stroke = 8 }) => {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - Math.min(progress, 1) * circ

  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0 -rotate-90"
      style={{ filter: 'drop-shadow(0 0 8px rgba(202,138,4,0.25))' }}
    >
      {/* track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        className="text-border/30"
        strokeWidth={stroke}
      />
      {/* fill */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#tasbih-gradient)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        className="transition-all duration-300 ease-out"
      />
      <defs>
        <linearGradient id="tasbih-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/* ════════════════════════════════════════════
   TasbihPage
   ════════════════════════════════════════════ */
const TasbihPage = () => {
  useDocTitle('عداد التسبيح')
  const saved = useMemo(() => loadState(), [])

  const [activeId, setActiveId] = useState(saved?.activeId ?? PRESETS[0].id)
  const [counts, setCounts] = useState(saved?.counts ?? {})
  const [totalAll, setTotalAll] = useState(saved?.totalAll ?? 0)
  const [customLabel, setCustomLabel] = useState(saved?.customLabel ?? '')
  const [customTarget, setCustomTarget] = useState(saved?.customTarget ?? 99)
  const [vibrate, setVibrate] = useState(saved?.vibrate ?? true)

  const btnRef = useRef(null)

  const active = useMemo(
    () => PRESETS.find((p) => p.id === activeId) ?? PRESETS[0],
    [activeId],
  )

  const currentCount = counts[activeId] ?? 0
  const target = activeId === 'custom' ? customTarget : active.target
  const progress = target > 0 ? currentCount / target : 0
  const isComplete = currentCount >= target

  /* persist */
  useEffect(() => {
    saveState({ activeId, counts, totalAll, customLabel, customTarget, vibrate })
  }, [activeId, counts, totalAll, customLabel, customTarget, vibrate])

  /* haptic feedback */
  const buzz = useCallback(
    (pattern = 30) => {
      if (vibrate && navigator.vibrate) navigator.vibrate(pattern)
    },
    [vibrate],
  )

  /* increment */
  const increment = useCallback(() => {
    setCounts((prev) => ({ ...prev, [activeId]: (prev[activeId] ?? 0) + 1 }))
    setTotalAll((t) => t + 1)
    buzz()

    const next = (counts[activeId] ?? 0) + 1
    if (next === target) {
      // completed — double buzz
      buzz([50, 30, 50])
    }
  }, [activeId, counts, target, buzz])

  /* reset current */
  const resetCurrent = () => {
    setCounts((prev) => ({ ...prev, [activeId]: 0 }))
    buzz(15)
  }

  /* reset all */
  const resetAll = () => {
    setCounts({})
    setTotalAll(0)
    buzz(15)
  }

  /* keyboard: space / enter to increment */
  useEffect(() => {
    const handler = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        if (document.activeElement === btnRef.current || document.activeElement === document.body) {
          e.preventDefault()
          increment()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [increment])

  const displayLabel =
    activeId === 'custom' ? customLabel || 'ذكر مخصص' : active.label

  return (
    <section className="space-y-6">
      <AppSectionTitle
        title="عداد التسبيح"
        subtitle="اختر الذكر وابدأ التسبيح — يُحفظ تلقائيًا"
      />

      {/* ── Dhikr Selector ── */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActiveId(p.id)}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${activeId === p.id
                ? 'bg-gold-500 text-background shadow-md'
                : 'bg-surface-soft text-textMuted hover:bg-surface hover:text-slate-100'
              }`}
          >
            {p.id === 'custom' ? 'مخصص' : p.label}
          </button>
        ))}
      </div>

      {/* ── Custom dhikr input ── */}
      {activeId === 'custom' && (
        <AppCard className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-textMuted">نص الذكر</label>
            <input
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-soft px-3 py-2 text-sm text-slate-100 focus:border-gold-500 focus:outline-none"
              placeholder="اكتب الذكر هنا..."
            />
          </div>
          <div className="w-28">
            <label className="mb-1 block text-xs text-textMuted">الهدف</label>
            <input
              type="number"
              min={1}
              value={customTarget}
              onChange={(e) => setCustomTarget(Math.max(1, Number(e.target.value) || 1))}
              className="w-full rounded-xl border border-border bg-surface-soft px-3 py-2 text-sm text-slate-100 focus:border-gold-500 focus:outline-none"
            />
          </div>
        </AppCard>
      )}

      {/* ── Main Counter ── */}
      <AppCard className="flex flex-col items-center gap-6 p-6 sm:p-8" elevated>
        {/* dhikr text */}
        <p className="text-center font-['Amiri',serif] text-2xl leading-relaxed text-slate-100 sm:text-3xl">
          {displayLabel}
        </p>

        {/* circular counter button */}
        <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
          <Ring progress={progress} />
          <button
            ref={btnRef}
            type="button"
            onClick={increment}
            className={`relative z-10 flex h-44 w-44 flex-col items-center justify-center rounded-full border-2 transition-all duration-150 active:scale-95 ${isComplete
                ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                : 'border-gold-500/40 bg-gold-500/5 hover:bg-gold-500/10 shadow-[0_0_30px_rgba(202,138,4,0.1)]'
              }`}
            aria-label="اضغط للتسبيح"
          >
            <output
              aria-live="polite"
              className={`text-5xl font-bold tabular-nums ${isComplete ? 'text-emerald-400' : 'text-gold-300'}`}
            >
              {currentCount}
            </output>
            <span className="mt-1 text-xs text-textMuted">
              / {target}
            </span>
          </button>
        </div>

        {/* completion badge */}
        {isComplete && (
          <div className="flex items-center gap-2 animate-pulse">
            <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className="text-sm font-medium text-emerald-400">
              أحسنت! أكملت الهدف
            </span>
          </div>
        )}

        {/* action buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={resetCurrent}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-soft px-4 py-2.5 text-sm font-medium text-textMuted transition hover:bg-surface hover:text-slate-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
            </svg>
            إعادة
          </button>
          <button
            type="button"
            onClick={() => setVibrate((v) => !v)}
            className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${vibrate
                ? 'border-gold-500/40 bg-gold-500/10 text-gold-300'
                : 'border-border bg-surface-soft text-textMuted hover:text-slate-100'
              }`}
            aria-label="تبديل الاهتزاز"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3" />
            </svg>
            {vibrate ? 'اهتزاز' : 'صامت'}
          </button>
        </div>

        <p className="text-xs text-textMuted">
          اضغط الدائرة أو <kbd className="rounded border border-border bg-surface-soft px-1.5 py-0.5 text-[10px]">Space</kbd> للتسبيح
        </p>
      </AppCard>

      {/* ── Stats Row ── */}
      <div className="grid gap-3 sm:grid-cols-3">
        <AppCard className="p-4 text-center">
          <p className="text-xs text-textMuted">العدد الحالي</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-gold-300">{currentCount}</p>
          <p className="text-xs text-textMuted">{displayLabel}</p>
        </AppCard>
        <AppCard className="p-4 text-center">
          <p className="text-xs text-textMuted">الهدف</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-100">{target}</p>
          <p className="text-xs text-textMuted">
            {isComplete ? (
              <AppBadge tone="success" className="mt-1">مكتمل ✓</AppBadge>
            ) : (
              `متبقي ${target - currentCount}`
            )}
          </p>
        </AppCard>
        <AppCard className="p-4 text-center">
          <p className="text-xs text-textMuted">إجمالي الجلسة</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-100">{totalAll}</p>
          <button
            type="button"
            onClick={resetAll}
            className="mt-1 text-[11px] text-textMuted underline decoration-dotted hover:text-gold-400 transition"
          >
            مسح الكل
          </button>
        </AppCard>
      </div>

      {/* ── All Dhikr Progress ── */}
      <AppCard className="p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-100">تقدمك في الأذكار</h2>
        <div className="space-y-3">
          {PRESETS.filter((p) => p.id !== 'custom').map((p) => {
            const c = counts[p.id] ?? 0
            const pct = Math.min(100, Math.round((c / p.target) * 100))
            return (
              <div key={p.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className={activeId === p.id ? 'font-semibold text-gold-300' : 'text-textMuted'}>
                    {p.label}
                  </span>
                  <span className="tabular-nums text-textMuted">
                    {c}/{p.target}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-soft">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-l from-gold-400 to-gold-600'
                      }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </AppCard>
    </section>
  )
}

export default TasbihPage
