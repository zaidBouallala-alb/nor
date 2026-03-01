import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { reverseGeocode, getSmartFallbackCity } from '../utils/prayerTimesApi'

const STORAGE_KEY = 'app-location'

const LocationContext = createContext({
    location: null,
    loading: true,
    detectLocation: () => { },
    showPopup: false,
    dismissPopup: () => { },
})

const readStoredLocation = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw)
        // Expire after 1 hour
        if (Date.now() - (parsed.timestamp || 0) > 60 * 60 * 1000) return null
        return parsed
    } catch {
        return null
    }
}

const saveLocation = (loc) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...loc, timestamp: Date.now() }))
    } catch { /* ignore */ }
}

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(() => readStoredLocation())
    const [loading, setLoading] = useState(!readStoredLocation())
    const [showPopup, setShowPopup] = useState(false)

    const detectLocation = useCallback(async () => {
        if (!navigator.geolocation) {
            // No geolocation support — use timezone fallback
            const city = getSmartFallbackCity()
            const loc = { mode: 'fallback', city, label: city }
            setLocation(loc)
            saveLocation(loc)
            setLoading(false)
            setShowPopup(false)
            return
        }

        setLoading(true)

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                const geo = await reverseGeocode(latitude, longitude)
                const label = geo?.label || 'موقعي الحالي'
                const city = geo?.city || getSmartFallbackCity()
                const country = geo?.country || ''

                const loc = { mode: 'gps', latitude, longitude, city, country, label }
                setLocation(loc)
                saveLocation(loc)
                setLoading(false)
                setShowPopup(false)
            },
            () => {
                // GPS denied/failed — use timezone fallback
                const city = getSmartFallbackCity()
                const loc = { mode: 'fallback', city, label: city }
                setLocation(loc)
                saveLocation(loc)
                setLoading(false)
                setShowPopup(false)
            },
            { enableHighAccuracy: true, timeout: 10000 },
        )
    }, [])

    const dismissPopup = useCallback(() => {
        setShowPopup(false)
        // Use timezone fallback if dismissed
        if (!location) {
            const city = getSmartFallbackCity()
            const loc = { mode: 'fallback', city, label: city }
            setLocation(loc)
            saveLocation(loc)
            setLoading(false)
        }
    }, [location])

    // On mount: if no cached location, show popup
    useEffect(() => {
        const cached = readStoredLocation()
        if (cached) {
            setLocation(cached)
            setLoading(false)
        } else {
            setShowPopup(true)
            setLoading(false)
        }
    }, [])

    const value = useMemo(() => ({
        location,
        loading,
        detectLocation,
        showPopup,
        dismissPopup,
    }), [location, loading, detectLocation, showPopup, dismissPopup])

    return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}

export const useLocation = () => useContext(LocationContext)
