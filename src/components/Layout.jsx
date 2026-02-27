import { useCallback, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const Layout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Toggle the mobile drawer
  const toggleDrawer = useCallback(() => setDrawerOpen((prev) => !prev), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  // Close drawer on ESC key
  useEffect(() => {
    if (!drawerOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeDrawer()
    }

    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll while drawer is open
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [drawerOpen, closeDrawer])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Skip link — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:right-4 focus:top-4 focus:z-50 focus:rounded-btn focus:bg-white focus:px-4 focus:py-2 focus:shadow-raised"
      >
        تخطّي إلى المحتوى
      </a>

      {/* ───── Desktop sidebar (always visible ≥ lg) ───── */}
      <aside
        aria-label="التنقل الرئيسي"
        className="fixed inset-y-0 start-0 z-40 hidden w-sidebar border-e border-slate-200 bg-white shadow-card lg:flex lg:flex-col"
      >
        <div className="flex h-topbar shrink-0 items-center border-b border-slate-200 px-5">
          <span className="text-base font-bold text-primary-800">☪︎ التطبيقات الإسلامية</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Sidebar />
        </div>
      </aside>

      {/* ───── Mobile drawer overlay ───── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* Drawer panel — slides in from the right (start) in RTL */}
          <aside
            aria-label="القائمة الرئيسية"
            className="fixed inset-y-0 start-0 z-50 flex w-72 flex-col bg-white shadow-drawer"
          >
            {/* Drawer header */}
            <div className="flex h-topbar shrink-0 items-center justify-between border-b border-slate-200 px-4">
              <span className="text-base font-bold text-primary-800">☪︎ التطبيقات الإسلامية</span>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="إغلاق القائمة"
                className="rounded-btn p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable nav area */}
            <div className="flex-1 overflow-y-auto">
              <Sidebar onNavigate={closeDrawer} />
            </div>
          </aside>
        </div>
      )}

      {/* ───── Main area (offset by sidebar width on desktop) ───── */}
      <div className="flex min-h-screen flex-col lg:ps-sidebar">
        <Topbar onMenuToggle={toggleDrawer} />

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-4 py-6 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-5xl rounded-card border border-slate-200 bg-white p-5 shadow-card sm:p-6">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-slate-100 px-4 py-4 text-center text-xs text-slate-400">
          نُور &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  )
}

export default Layout
