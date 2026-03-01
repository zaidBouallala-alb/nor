import { NavLink } from 'react-router-dom'

/* ──────────────────────────────────────────────
   Navigation items — icon + Arabic label
   ────────────────────────────────────────────── */
const navItems = [
  {
    label: 'الرئيسية',
    to: '/',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    label: 'مواقيت الصلاة',
    to: '/prayer-times',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
      </svg>
    ),
  },
  {
    label: 'اتجاه القبلة',
    to: '/qibla',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.269 20.874L5.999 12zm0 0h7.5" />
      </svg>
    ),
  },
  {
    label: 'عداد التسبيح',
    to: '/tasbih',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    label: 'الأذكار',
    to: '/athkar',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  },
  {
    label: 'القرآن',
    to: '/quran',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
      </svg>
    ),
  },
  {
    label: 'الإعدادات',
    to: '/settings',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h3m-7.114 3.34l2.121 2.121m7.786 0l2.121-2.121M6 13.5h3m6 0h3m-11.614 3.16l2.121-2.121m7.786 0l2.121 2.121M10.5 18h3" />
        <circle cx="12" cy="12" r="2.25" />
      </svg>
    ),
  },
]

/* ──────────────────────────────────────────────
   Sidebar
   – `collapsed` — icon-only mode (desktop)
   – `onNavigate` — close mobile drawer on click
   – `onToggleCollapse` — toggle collapse state
   ────────────────────────────────────────────── */
const Sidebar = ({ onNavigate, collapsed = false, onToggleCollapse }) => {
  return (
    <nav
      className="flex h-full flex-col justify-between p-3"
      aria-label="القائمة الرئيسية"
    >
      {/* ── Nav links ── */}
      <div className="flex flex-col gap-2">
        {!collapsed && (
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-textMuted/70">
            القائمة الرئيسية
          </p>
        )}

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              [
                // Base
                'group relative flex items-center text-sm font-bold',
                'transition-all duration-300 ease-out overflow-hidden',
                // Focus ring
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500',
                // Sizing: collapsed = square, expanded = full width rectangle
                collapsed
                  ? 'w-12 h-12 mx-auto justify-center rounded-2xl p-0'
                  : 'gap-3.5 px-4 py-3.5 w-full rounded-2xl',
                // Active vs inactive
                isActive
                  ? 'bg-gold-500/15 text-gold-300'
                  : 'text-textMuted hover:bg-white/5 hover:text-slate-100',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                {/* Active Indicator & Glow */}
                {isActive && (
                  <>
                    {!collapsed && <div className="absolute inset-0 bg-gradient-to-l from-gold-500/0 to-gold-500/5 opacity-50" />}
                    <span
                      aria-hidden="true"
                      className={[
                        'absolute bg-gold-400 shadow-[0_0_12px_rgba(215,169,62,0.8)]',
                        collapsed
                          ? 'bottom-0 left-1/2 h-1 w-6 -translate-x-1/2 rounded-t-full' // bottom curved dot for collapsed
                          : 'inset-y-2 end-0 w-1.5 rounded-s-full'   // edge vertical line for expanded
                      ].join(' ')}
                    />
                  </>
                )}

                <span
                  aria-hidden="true"
                  className={[
                    'relative z-10 shrink-0 transition-all duration-300',
                    isActive
                      ? 'scale-110 text-gold-400 drop-shadow-[0_2px_8px_rgba(215,169,62,0.4)]'
                      : 'text-textMuted/80 group-hover:scale-105 group-hover:text-slate-200',
                  ].join(' ')}
                >
                  {item.icon}
                </span>

                {!collapsed && (
                  <span className="relative z-10 truncate">{item.label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* ── Collapse toggle (desktop only, hidden in mobile drawer) ── */}
      {onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
          className={[
            'mt-4 flex items-center rounded-xl p-2 text-textMuted transition-colors duration-200',
            'hover:bg-surface-soft hover:text-slate-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            collapsed ? 'justify-center' : 'justify-end gap-2',
          ].join(' ')}
        >
          {/* Chevron: flip horizontally when collapsed (RTL-aware) */}
          <svg
            className={[
              'h-4 w-4 transition-transform duration-300',
              collapsed ? 'rotate-180' : '',
            ].join(' ')}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {!collapsed && (
            <span className="text-xs">طي القائمة</span>
          )}
        </button>
      )}
    </nav>
  )
}

export default Sidebar
