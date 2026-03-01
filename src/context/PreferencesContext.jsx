import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'appPreferences'

const defaultPreferences = {
  theme: 'dark',
  fontScale: 1,
  readingMode: 'comfortable',
  enableAnimations: true,
}

const PreferencesContext = createContext({
  preferences: defaultPreferences,
  setPreference: () => { },
  resetPreferences: () => { },
})

const readStoredPreferences = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return defaultPreferences
    }

    const parsed = JSON.parse(raw)
    return {
      ...defaultPreferences,
      ...parsed,
    }
  } catch {
    return defaultPreferences
  }
}

export const PreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(readStoredPreferences)

  const setPreference = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const resetPreferences = () => {
    setPreferences(defaultPreferences)
  }

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
    } catch {
      // ignore quota/private mode issues
    }

    const html = document.documentElement
    const body = document.body

    /* Font scale: Tailwind uses rem → must scale <html> font-size.
       Default browser = 16px, so 1.1 → 17.6px, 1.2 → 19.2px */
    html.style.fontSize = `${16 * preferences.fontScale}px`
    body.dataset.readingMode = preferences.readingMode

    body.classList.toggle('theme-dimmer', preferences.theme === 'dimmer')
    body.classList.toggle('animations-disabled', !preferences.enableAnimations)
  }, [preferences])

  const value = useMemo(
    () => ({
      preferences,
      setPreference,
      resetPreferences,
    }),
    [preferences],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export const usePreferences = () => useContext(PreferencesContext)
