import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import AthkarPage from './pages/AthkarPage'
import HomePage from './pages/HomePage'
import PrayerTimesPage from './pages/PrayerTimesPage'
import QiblaPage from './pages/QiblaPage'
import QuranPage from './pages/QuranPage'
import SettingsPage from './pages/SettingsPage'
import SurahPage from './pages/SurahPage'
import TasbihPage from './pages/TasbihPage'

function App() {
  return (
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
  )
}

export default App
