import { useEffect, useMemo, useState } from 'react'

const InstallAppButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(() => (
    window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
  ))

  const isIOS = useMemo(
    () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
    [],
  )

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
    }

    const onInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
      return
    }

    if (isIOS) {
      window.alert('على iPhone: افتح زر المشاركة ثم اختر "Add to Home Screen".')
    }
  }

  if (isInstalled) return null
  if (!deferredPrompt && !isIOS) return null

  return (
    <button
      type="button"
      onClick={handleInstall}
      className="inline-flex items-center gap-1 rounded-full border border-gold-500/35 bg-gold-500/10 px-3 py-1 text-xs font-semibold text-gold-300 transition hover:bg-gold-500/20"
    >
      تثبيت التطبيق
    </button>
  )
}

export default InstallAppButton
