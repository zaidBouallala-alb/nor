import { useMemo } from 'react'
import AppCard from '../components/AppCard'
import AppSectionTitle from '../components/AppSectionTitle'
import { usePreferences } from '../context/PreferencesContext'
import useDocTitle from '../hooks/useDocTitle'

/* ── Option card with icon ── */
const OptionCard = ({ icon, label, description, children }) => (
  <div className="flex items-start gap-4 rounded-2xl border border-border/50 bg-surface-soft/30 p-4 transition-colors hover:border-border/70">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400 ring-1 ring-gold-500/20">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-bold text-slate-100">{label}</p>
      {description && <p className="mt-0.5 text-xs text-textMuted">{description}</p>}
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </div>
  </div>
)

/* ── Pill button ── */
const Pill = ({ active, onClick, children, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={[
      'rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      active
        ? 'border-gold-500/60 bg-gold-500/15 text-gold-300 shadow-[0_0_12px_rgba(215,169,62,0.1)]'
        : 'border-border/60 bg-surface-soft/50 text-textMuted hover:border-border hover:bg-surface hover:text-slate-200',
      className,
    ].join(' ')}
  >
    {children}
  </button>
)

/* ── Toggle switch ── */
const Toggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
    dir="ltr"
    className={[
      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      checked ? 'bg-gold-500/40' : 'bg-white/10',
    ].join(' ')}
  >
    <span
      className={[
        'pointer-events-none inline-block h-4 w-4 rounded-full shadow transition-transform duration-200',
        checked
          ? 'translate-x-[1.375rem] bg-gold-400'
          : 'translate-x-1 bg-slate-400',
      ].join(' ')}
    />
  </button>
)

/* ═══════════════════════════════════════════
   SettingsPage — Smart & Clean
   ═══════════════════════════════════════════ */
const SettingsPage = () => {
  useDocTitle('الإعدادات')
  const { preferences, setPreference, resetPreferences } = usePreferences()

  // Live preview text for font scale
  const previewSize = useMemo(() => {
    const base = 16 * preferences.fontScale
    return `${base.toFixed(0)}px`
  }, [preferences.fontScale])

  return (
    <section className="space-y-6">
      <AppSectionTitle
        title="الإعدادات"
        subtitle="خصّص مظهر التطبيق وتجربة القراءة حسب تفضيلاتك"
      />

      <AppCard className="space-y-5 p-5 sm:p-6" elevated>
        {/* ── Theme ── */}
        <OptionCard
          label="المظهر"
          description="اختر سمة الألوان المناسبة لعينيك"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
          }
        >
          <Pill active={preferences.theme === 'dark'} onClick={() => setPreference('theme', 'dark')}>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#0a1538] ring-1 ring-white/20" />
              داكن
            </span>
          </Pill>
          <Pill active={preferences.theme === 'dimmer'} onClick={() => setPreference('theme', 'dimmer')}>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#050915] ring-1 ring-white/20" />
              داكن هادئ
            </span>
          </Pill>
        </OptionCard>

        {/* ── Font Scale ── */}
        <OptionCard
          label="حجم الخط"
          description={`الحجم الحالي: ${previewSize} — يُطبّق على جميع النصوص`}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
            </svg>
          }
        >
          {[
            { value: 0.9, label: 'صغير', indicator: 'أ' },
            { value: 1, label: 'عادي', indicator: 'أ' },
            { value: 1.1, label: 'كبير', indicator: 'أ' },
            { value: 1.2, label: 'أكبر', indicator: 'أ' },
          ].map((opt) => (
            <Pill
              key={opt.value}
              active={preferences.fontScale === opt.value}
              onClick={() => setPreference('fontScale', opt.value)}
            >
              <span className="flex items-center gap-2">
                <span
                  className="font-bold text-gold-400"
                  style={{ fontSize: `${12 * opt.value}px` }}
                >
                  {opt.indicator}
                </span>
                {opt.label}
              </span>
            </Pill>
          ))}
        </OptionCard>

        {/* ── Reading Mode ── */}
        <OptionCard
          label="وضع القراءة"
          description="تحكّم في المسافات بين الأسطر"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          }
        >
          <Pill
            active={preferences.readingMode === 'compact'}
            onClick={() => setPreference('readingMode', 'compact')}
          >
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-textMuted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 9.75h16.5M3.75 12.75h16.5M3.75 15.75h16.5" />
              </svg>
              مضغوط
            </span>
          </Pill>
          <Pill
            active={preferences.readingMode === 'comfortable'}
            onClick={() => setPreference('readingMode', 'comfortable')}
          >
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-textMuted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5M3.75 10.5h16.5M3.75 15.75h16.5" />
              </svg>
              مريح
            </span>
          </Pill>
        </OptionCard>

        {/* ── Animations ── */}
        <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-surface-soft/30 p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400 ring-1 ring-gold-500/20">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100">الحركات والتأثيرات</p>
              <p className="text-xs text-textMuted">
                {preferences.enableAnimations ? 'مفعلة — حركات سلسة في الواجهة' : 'متوقفة — بدون حركات'}
              </p>
            </div>
          </div>
          <Toggle
            checked={preferences.enableAnimations}
            onChange={() => setPreference('enableAnimations', !preferences.enableAnimations)}
            label="تبديل الحركات"
          />
        </div>

        {/* ── Live Preview ── */}
        <div className="rounded-2xl border border-border/50 bg-surface-soft/30 p-4">
          <p className="mb-2 text-xs font-semibold text-textMuted">معاينة مباشرة</p>
          <p className="font-['Amiri',serif] text-lg leading-relaxed text-slate-100">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
          <p className="mt-1 text-sm text-textMuted">
            غيّر حجم الخط أو وضع القراءة وشاهد التأثير هنا مباشرةً.
          </p>
        </div>

        {/* ── Reset ── */}
        <div className="flex items-center justify-between border-t border-border/40 pt-4">
          <div>
            <p className="text-sm font-semibold text-slate-100">إعادة الضبط</p>
            <p className="text-xs text-textMuted">استعادة جميع الإعدادات الافتراضية</p>
          </div>
          <button
            type="button"
            onClick={resetPreferences}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
            </svg>
            إعادة الضبط
          </button>
        </div>
      </AppCard>

      {/* ── About ── */}
      <AppCard className="p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="" className="h-10 w-10" />
          <div>
            <p className="text-sm font-bold text-gold-300">نُور</p>
            <p className="text-xs text-textMuted">رفيقك الإسلامي اليومي — الإصدار ١.٠</p>
          </div>
        </div>
      </AppCard>
    </section>
  )
}

export default SettingsPage
