import { useEffect, useState } from 'react'

const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) {
    return null
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-4 mt-3 rounded-xl border border-gold-500/35 bg-gold-500/10 px-3 py-2 text-sm text-gold-300 sm:mx-6"
    >
      أنت الآن دون اتصال. سيتم عرض البيانات المحفوظة محليًا.
    </div>
  )
}

export default OfflineBanner
