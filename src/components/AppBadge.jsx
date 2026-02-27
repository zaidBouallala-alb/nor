const toneMap = {
  gold: 'border-gold-500/40 bg-gold-500/15 text-gold-300',
  neutral: 'border-border bg-surface-soft text-textMuted',
  success: 'border-primary-500/40 bg-primary-500/15 text-emerald-300',
}

const AppBadge = ({ children, className = '', tone = 'gold' }) => {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold',
        toneMap[tone] ?? toneMap.neutral,
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}

export default AppBadge
