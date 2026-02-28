import { useCallback, useEffect, useMemo, useState } from 'react'
import AppBadge from '../components/AppBadge'
import AppCard from '../components/AppCard'
import AppSectionTitle from '../components/AppSectionTitle'
import athkarData from '../data/athkarData.json'

const STORAGE_KEY = 'athkar-progress-v2'

/* ── category icons ── */
const iconMap = {
  sunrise: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  ),
  moon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  ),
  prayer: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  sleep: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9 .913 2.476L13.15 12l-2.487.524L9.75 15l-.913-2.476L6.35 12l2.487-.524L9.75 9Z" />
    </svg>
  ),
  sun: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  ),
  food: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12" />
    </svg>
  ),
  mosque: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h-8.25V3.545m16.5 0a2.25 2.25 0 0 0-2.188 1.72L17.25 12h4.312l-1.562-6.735A2.25 2.25 0 0 0 17.812 3.545m-14.125 0a2.25 2.25 0 0 1 2.188 1.72L7.438 12H3.125l1.562-6.735a2.25 2.25 0 0 1 2.188-1.72" />
    </svg>
  ),
  travel: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
  ),
  heart: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  ),
  star: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  ),
}

/* ── load / save progress ── */
const loadProgress = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/* ── single dhikr card with counter ── */
const DhikrEntry = ({ entry, done, onCount }) => {
  const isDone = done >= entry.repeat

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${isDone
        ? 'border-emerald-500/30 bg-emerald-500/5'
        : 'border-border/50 bg-surface-soft/50'
        }`}
    >
      {/* text */}
      <p className="font-['Amiri',serif] text-lg leading-[2] text-slate-100 sm:text-xl">
        {entry.text}
      </p>

      {/* meta row */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {entry.source && (
          <AppBadge tone="neutral" className="text-[10px]">
            {entry.source}
          </AppBadge>
        )}
        {entry.note && (
          <span className="text-[11px] text-textMuted">— {entry.note}</span>
        )}
      </div>

      {/* counter row */}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onCount}
          disabled={isDone}
          className={`flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition active:scale-95 ${isDone
            ? 'cursor-default bg-emerald-500/15 text-emerald-400'
            : 'bg-gold-500/15 text-gold-300 hover:bg-gold-500/25 border border-gold-500/30'
            }`}
        >
          {isDone ? (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              تم
            </>
          ) : (
            '+ ذكر'
          )}
        </button>

        {/* progress bar */}
        <div className="flex flex-1 items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-soft">
            <div
              className={`h-full rounded-full transition-all duration-300 ${isDone ? 'bg-emerald-500' : 'bg-gradient-to-l from-gold-400 to-gold-600'
                }`}
              style={{ width: `${Math.min(100, (done / entry.repeat) * 100)}%` }}
            />
          </div>
          <span className="min-w-[3rem] text-left text-xs tabular-nums text-textMuted">
            {done}/{entry.repeat}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   AthkarPage
   ═══════════════════════════════════════════ */
const AthkarPage = () => {
  const categories = athkarData.categories
  const [openId, setOpenId] = useState(null)
  const [progress, setProgress] = useState(() => loadProgress())
  const [filter, setFilter] = useState('all')

  /* persist progress */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  const handleCount = useCallback((entryId, maxRepeat) => {
    setProgress((prev) => {
      const cur = prev[entryId] ?? 0
      if (cur >= maxRepeat) return prev
      return { ...prev, [entryId]: cur + 1 }
    })
  }, [])

  const resetCategory = useCallback((catId) => {
    setProgress((prev) => {
      const next = { ...prev }
      const cat = categories.find((c) => c.id === catId)
      if (cat) cat.entries.forEach((e) => delete next[e.id])
      return next
    })
  }, [categories])

  const resetAll = useCallback(() => setProgress({}), [])

  /* stats */
  const stats = useMemo(() => {
    let totalDhikr = 0
    let totalDone = 0
    let completedCats = 0

    for (const cat of categories) {
      let catDone = true
      for (const e of cat.entries) {
        const done = progress[e.id] ?? 0
        totalDhikr += e.repeat
        totalDone += Math.min(done, e.repeat)
        if (done < e.repeat) catDone = false
      }
      if (catDone) completedCats++
    }

    return { totalDhikr, totalDone, completedCats, totalCats: categories.length }
  }, [categories, progress])

  const overallPct = stats.totalDhikr > 0 ? Math.round((stats.totalDone / stats.totalDhikr) * 100) : 0

  /* category completion helper */
  const catProgress = useCallback(
    (cat) => {
      let done = 0
      let total = 0
      for (const e of cat.entries) {
        total += e.repeat
        done += Math.min(progress[e.id] ?? 0, e.repeat)
      }
      return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
    },
    [progress],
  )

  /* filtered categories */
  const displayed = useMemo(() => {
    if (filter === 'all') return categories
    if (filter === 'incomplete') return categories.filter((c) => catProgress(c).pct < 100)
    if (filter === 'completed') return categories.filter((c) => catProgress(c).pct >= 100)
    return categories
  }, [categories, filter, catProgress])

  return (
    <section className="space-y-6">
      <AppSectionTitle
        title="أذكار يومية"
        subtitle={`${categories.length} تصنيف • ${categories.reduce((s, c) => s + c.entries.length, 0)} ذكر — اضغط للعدّ وتابع تقدمك`}
      />

      {/* ── Overall Progress Card ── */}
      <AppCard className="p-5" elevated>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* circular progress */}
            <div className="relative flex h-20 w-20 items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" width={80} height={80}>
                <circle cx={40} cy={40} r={34} fill="none" stroke="currentColor" className="text-border/30" strokeWidth={6} />
                <circle
                  cx={40} cy={40} r={34} fill="none"
                  stroke={overallPct >= 100 ? '#10b981' : '#ca8a04'}
                  strokeWidth={6} strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 34}
                  strokeDashoffset={2 * Math.PI * 34 * (1 - overallPct / 100)}
                  className="transition-all duration-500"
                />
              </svg>
              <span className={`relative text-lg font-bold tabular-nums ${overallPct >= 100 ? 'text-emerald-400' : 'text-gold-300'}`}>
                {overallPct}%
              </span>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-100">التقدم اليومي</p>
              <p className="text-xs text-textMuted">
                {stats.completedCats}/{stats.totalCats} تصنيفات مكتملة • {stats.totalDone}/{stats.totalDhikr} ذكر
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetAll}
            className="flex items-center gap-1.5 self-start rounded-xl border border-border bg-surface-soft px-4 py-2 text-xs font-medium text-textMuted transition hover:text-slate-100"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
            </svg>
            إعادة تعيين الكل
          </button>
        </div>
      </AppCard>

      {/* ── Filter Tabs ── */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'الكل' },
          { key: 'incomplete', label: 'غير مكتمل' },
          { key: 'completed', label: 'مكتمل' },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-xl px-3 py-2 text-xs font-medium transition ${filter === f.key
              ? 'bg-gold-500 text-background'
              : 'bg-surface-soft text-textMuted hover:bg-surface hover:text-slate-100'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Category Accordion Grid ── */}
      <div className="columns-1 gap-4 lg:columns-2" aria-live="polite">
        {displayed.map((cat) => {
          const isOpen = openId === cat.id
          const cp = catProgress(cat)
          const panelId = `athkar-panel-${cat.id}`

          return (
            <AppCard as="article" key={cat.id} className="mb-4 break-inside-avoid overflow-hidden">
              {/* header button */}
              <button
                type="button"
                onClick={() => setOpenId((prev) => (prev === cat.id ? null : cat.id))}
                onKeyDown={(e) => {
                  if (e.key === 'Escape' && isOpen) {
                    setOpenId(null);
                  }
                }}
                className="flex w-full items-center gap-3 p-4 text-start transition hover:bg-surface-soft/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                {/* icon */}
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border/70 bg-surface/80 text-gold-400">
                  {iconMap[cat.icon] ?? iconMap.star}
                </span>

                {/* title + meta */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-100">{cat.title}</p>
                    {cp.pct >= 100 && (
                      <svg className="h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-textMuted">{cat.entries.length} أذكار</p>
                  {/* mini progress bar */}
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-soft">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${cp.pct >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-l from-gold-400 to-gold-600'
                        }`}
                      style={{ width: `${cp.pct}%` }}
                    />
                  </div>
                </div>

                {/* count + chevron */}
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs tabular-nums text-textMuted">{cp.pct}%</span>
                  <svg
                    className={`h-4 w-4 text-textMuted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* expanded panel */}
              <div
                id={panelId}
                role="region"
                aria-label={`محتوى ${cat.title}`}
                className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
              >
                <div className="space-y-3 border-t border-border/50 p-4">
                  {/* reset category */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => resetCategory(cat.id)}
                      className="text-[11px] text-textMuted underline decoration-dotted hover:text-gold-400 transition"
                    >
                      إعادة تعيين هذا التصنيف
                    </button>
                  </div>

                  {cat.entries.map((entry) => (
                    <DhikrEntry
                      key={entry.id}
                      entry={entry}
                      done={progress[entry.id] ?? 0}
                      onCount={() => handleCount(entry.id, entry.repeat)}
                    />
                  ))}
                </div>
              </div>
            </AppCard>
          )
        })}

        {displayed.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-textMuted">
            {filter === 'completed' ? 'لم تُكمل أي تصنيف بعد. هيا ابدأ!' : 'أحسنت! أكملت جميع الأذكار.'}
          </p>
        )}
      </div>
    </section>
  )
}

export default AthkarPage
