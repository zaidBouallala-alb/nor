import { useCallback, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import AppContainer from './AppContainer'
import OfflineBanner from './OfflineBanner'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const COLLAPSED_KEY = 'sidebar-collapsed'

const AppLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === '1'
    } catch {
      return false
    }
  })

  const toggleDrawer = useCallback(() => setDrawerOpen((prev) => !prev), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0')
      } catch {
        /* silent */
      }
      return next
    })
  }, [])

  /* Close drawer on Escape */
  useEffect(() => {
    if (!drawerOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeDrawer()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [drawerOpen, closeDrawer])

  /* Dynamic sidebar width class */
  const sidebarW = collapsed ? 'w-sidebar-collapsed' : 'w-sidebar'
  const mainPad = collapsed ? 'lg:ps-sidebar-collapsed' : 'lg:ps-sidebar'

  return (
    <div className="min-h-screen bg-transparent text-slate-100">
      {/* Skip-to-content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:right-4 focus:top-4 focus:z-[90] focus:rounded-xl focus:bg-surface focus:px-4 focus:py-2 focus:text-slate-100 focus:shadow-elevated"
      >
        تخطّي إلى المحتوى
      </a>

      {/* ── Desktop fixed sidebar ── */}
      <aside
        aria-label="التنقل الرئيسي"
        className={[
          'fixed inset-y-0 start-0 z-50 hidden border-e border-border/70 bg-surface/90 backdrop-blur-sm',
          'transition-[width] duration-300 ease-in-out',
          'lg:flex lg:flex-col',
          sidebarW,
        ].join(' ')}
      >
        {/* Brand header */}
        <div
          className={[
            'flex h-topbar items-center border-b border-border/70 transition-all duration-300',
            collapsed ? 'justify-center px-2' : 'px-5',
          ].join(' ')}
        >
          {collapsed ? (
            <img src="/logo.svg" alt="نُور" className="h-8 w-8" />
          ) : (
            <span className="flex items-center gap-2 text-lg font-bold text-gold-300"><img src="/logo.svg" alt="" className="h-7 w-7" /> نُور</span>
          )}
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto">
          <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />
        </div>
      </aside>

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label="قائمة التنقل">
          {/* Overlay */}
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="إغلاق القائمة"
            className="absolute inset-0 h-full w-full bg-background/75 backdrop-blur-[1px]"
          />

          <aside className="absolute inset-y-0 start-0 z-[81] flex w-72 max-w-[85vw] flex-col border-e border-border/70 bg-surface shadow-drawer">
            <div className="flex h-topbar items-center justify-between border-b border-border/70 px-4">
              <span className="flex items-center gap-2 text-base font-bold text-gold-300"><img src="/logo.svg" alt="" className="h-7 w-7" /> نُور</span>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="إغلاق القائمة"
                className="rounded-xl p-2 text-textMuted transition hover:bg-surface-soft hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {/* Mobile drawer always expanded, no collapse toggle */}
              <Sidebar onNavigate={closeDrawer} />
            </div>
          </aside>
        </div>
      )}

      {/* ── Main content area ── */}
      <div
        className={[
          'min-h-screen transition-[padding-inline-start] duration-300 ease-in-out',
          mainPad,
        ].join(' ')}
      >
        <Topbar onMenuToggle={toggleDrawer} />
        <OfflineBanner />

        <main id="main-content" tabIndex={-1} className="py-5 sm:py-6">
          <AppContainer>
            <Outlet />
          </AppContainer>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
