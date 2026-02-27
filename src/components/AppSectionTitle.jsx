const AppSectionTitle = ({ title, subtitle, className = '' }) => {
  return (
    <header className={`space-y-1 ${className}`}>
      <h1 className="text-2xl font-bold text-gold-300 sm:text-3xl">{title}</h1>
      {subtitle ? <p className="text-sm text-textMuted">{subtitle}</p> : null}
    </header>
  )
}

export default AppSectionTitle
