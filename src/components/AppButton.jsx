const variantClassMap = {
  primary:
    'bg-gold-500 text-background hover:bg-gold-400 border border-gold-400/70 shadow-soft focus-visible:ring-gold-400',
  secondary:
    'bg-surface-soft text-slate-100 hover:bg-surface border border-border focus-visible:ring-gold-400',
  ghost:
    'bg-transparent text-textMuted hover:text-gold-300 hover:bg-surface/60 border border-transparent focus-visible:ring-gold-400',
}

const AppButton = ({
  children,
  className = '',
  variant = 'primary',
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        variantClassMap[variant] ?? variantClassMap.primary,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}

export default AppButton
