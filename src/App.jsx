import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'

/* ── Lazy-loaded pages (each becomes its own chunk) ──────── */
const HomePage = lazy(() => import('./pages/HomePage'))
const PrayerTimesPage = lazy(() => import('./pages/PrayerTimesPage'))
const QiblaPage = lazy(() => import('./pages/QiblaPage'))
const QuranPage = lazy(() => import('./pages/QuranPage'))
const AthkarPage = lazy(() => import('./pages/AthkarPage'))
const TasbihPage = lazy(() => import('./pages/TasbihPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const SurahPage = lazy(() => import('./pages/SurahPage'))

/* ── Page loading spinner ────────────────────────────────── */
const PageSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="h-10 w-10 animate-spin rounded-full border-3 border-gold-500/30 border-t-gold-500" />
  </div>
)

function App() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/qibla" element={<QiblaPage />} />
          <Route path="/prayer-times" element={<PrayerTimesPage />} />
          <Route path="/tasbih" element={<TasbihPage />} />
          <Route path="/athkar" element={<AthkarPage />} />
          <Route path="/quran" element={<QuranPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/surah/:number" element={<SurahPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
