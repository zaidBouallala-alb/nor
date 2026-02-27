const AppCard = ({
  as: Tag = 'section',
  children,
  className = '',
  elevated = false,
  glass = true,
}) => {
  const baseClass = glass
    ? 'rounded-2xl border border-border/70 bg-surface-glass backdrop-blur-sm'
    : 'rounded-2xl border border-border/70 bg-surface'

  const shadowClass = elevated ? 'shadow-elevated' : 'shadow-soft'

  return <Tag className={`${baseClass} ${shadowClass} ${className}`}>{children}</Tag>
}

export default AppCard
