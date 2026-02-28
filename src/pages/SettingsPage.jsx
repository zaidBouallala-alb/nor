import AppButton from '../components/AppButton'
import AppCard from '../components/AppCard'
import AppSectionTitle from '../components/AppSectionTitle'
import { usePreferences } from '../context/PreferencesContext'

const ToggleGroup = ({ label, value, options, onChange }) => {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-100">{label}</p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            onClick={() => onChange(option.value)}
            className={[
              'rounded-xl border px-3 py-2 text-sm font-medium transition',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              value === option.value
                ? 'border-gold-500/60 bg-gold-500/15 text-gold-300'
                : 'border-border/80 bg-surface-soft text-textMuted hover:bg-surface hover:text-slate-100',
            ].join(' ')}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

const SettingsPage = () => {
  const { preferences, setPreference, resetPreferences } = usePreferences()

  return (
    <section className="space-y-5">
      <AppSectionTitle
        title="الإعدادات"
        subtitle="خصّص الواجهة وطريقة القراءة حسب تفضيلاتك"
      />

      <AppCard className="space-y-5 p-5" elevated>
        <ToggleGroup
          label="المظهر"
          value={preferences.theme}
          onChange={(next) => setPreference('theme', next)}
          options={[
            { label: 'داكن', value: 'dark' },
            { label: 'داكن هادئ', value: 'dimmer' },
          ]}
        />

        <ToggleGroup
          label="حجم الخط"
          value={preferences.fontScale}
          onChange={(next) => setPreference('fontScale', next)}
          options={[
            { label: '١٠٠٪', value: 1 },
            { label: '١١٠٪', value: 1.1 },
            { label: '١٢٠٪', value: 1.2 },
          ]}
        />

        <ToggleGroup
          label="وضع القراءة"
          value={preferences.readingMode}
          onChange={(next) => setPreference('readingMode', next)}
          options={[
            { label: 'مضغوط', value: 'compact' },
            { label: 'مريح', value: 'comfortable' },
          ]}
        />

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-100">الحركات</p>
          <button
            type="button"
            role="switch"
            aria-checked={preferences.enableAnimations}
            onClick={() => setPreference('enableAnimations', !preferences.enableAnimations)}
            className={[
              'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              preferences.enableAnimations
                ? 'border-gold-500/60 bg-gold-500/15 text-gold-300'
                : 'border-border/80 bg-surface-soft text-textMuted hover:bg-surface hover:text-slate-100',
            ].join(' ')}
          >
            {preferences.enableAnimations ? 'مفعلة' : 'متوقفة'}
          </button>
        </div>

        <div className="pt-2">
          <AppButton onClick={resetPreferences} variant="secondary">
            إعادة الضبط الافتراضي
          </AppButton>
        </div>
      </AppCard>
    </section>
  )
}

export default SettingsPage
