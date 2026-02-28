import { NavLink } from 'react-router-dom'
import ClockWidget from './ClockWidget'
import InstallAppButton from './InstallAppButton'

/**
 * Top application bar.
 * – Brand bar (logo + hamburger) on top.
 * – Smart full-width ClockWidget always visible below.
 */
const Topbar = ({ onMenuToggle }) => {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg">
      {/* ── Row 1: Brand bar ── */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile / tablet only */}
          <button
            type="button"
            onClick={onMenuToggle}
            aria-label="فتح القائمة"
            className="inline-flex items-center justify-center rounded-xl p-2 text-textMuted transition-colors hover:bg-surface-soft hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* App brand */}
          <NavLink
            to="/"
            className="flex items-center gap-2 text-lg font-bold leading-none text-gold-300 transition-colors hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <img src="/logo.svg" alt="" className="h-7 w-7" />
            <span>نُور</span>
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          <InstallAppButton />
          <span className="hidden shrink-0 rounded-full border border-gold-500/35 bg-gold-500/10 px-3 py-1 text-xs font-semibold text-gold-300 sm:inline-flex">
            رفيقك الإسلامي اليومي
          </span>
        </div>
      </div>

      {/* ── Row 2: Smart Status Bar — always visible ── */}
      <ClockWidget />
    </header>
  )
}

export default Topbar
