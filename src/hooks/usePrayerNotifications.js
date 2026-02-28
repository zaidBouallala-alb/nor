import { useCallback, useEffect, useRef, useState } from 'react'

/* ── Prayer notification preferences ──────────────────────── */
const STORAGE_KEY = 'prayer-notif-prefs'
const PRAYER_NAMES_AR = {
    Fajr: 'الفجر',
    Dhuhr: 'الظهر',
    Asr: 'العصر',
    Maghrib: 'المغرب',
    Isha: 'العشاء',
}

const NOTIFIABLE_PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

const readPrefs = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return null
        return JSON.parse(raw)
    } catch {
        return null
    }
}

const writePrefs = (prefs) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch { /* silent */ }
}

const defaultToggles = () =>
    Object.fromEntries(NOTIFIABLE_PRAYERS.map((p) => [p, true]))

/* ── Parse "HH:MM" to today's Date ──────────────────────── */
const timeToDate = (timeStr) => {
    if (!timeStr || !timeStr.includes(':')) return null
    const [h, m] = timeStr.split(':').map(Number)
    if (Number.isNaN(h) || Number.isNaN(m)) return null
    const d = new Date()
    d.setHours(h, m, 0, 0)
    return d
}

/**
 * usePrayerNotifications
 *
 * Schedules browser notifications for each enabled prayer.
 * @param {Array} prayers - [{name, time}, ...]
 */
const usePrayerNotifications = (prayers) => {
    const stored = readPrefs()
    const [enabled, setEnabledState] = useState(stored?.enabled ?? false)
    const [perPrayer, setPerPrayer] = useState(stored?.perPrayer ?? defaultToggles())
    const [permissionStatus, setPermissionStatus] = useState(
        typeof Notification !== 'undefined' ? Notification.permission : 'default',
    )
    const timersRef = useRef([])

    /* ── Persist prefs ─────────────────────────────────────── */
    useEffect(() => {
        writePrefs({ enabled, perPrayer })
    }, [enabled, perPrayer])

    /* ── Request permission & toggle ───────────────────────── */
    const setEnabled = useCallback(async (next) => {
        if (next && typeof Notification !== 'undefined' && Notification.permission === 'default') {
            const result = await Notification.requestPermission()
            setPermissionStatus(result)
            if (result !== 'granted') return
        }
        setEnabledState(next)
    }, [])

    const togglePrayer = useCallback((prayerName) => {
        setPerPrayer((prev) => ({
            ...prev,
            [prayerName]: !prev[prayerName],
        }))
    }, [])

    /* ── Schedule notifications ────────────────────────────── */
    useEffect(() => {
        // Clear any existing timers
        timersRef.current.forEach(clearTimeout)
        timersRef.current = []

        if (!enabled || typeof Notification === 'undefined' || Notification.permission !== 'granted') {
            return
        }
        if (!prayers || prayers.length === 0) return

        const now = Date.now()

        for (const prayer of prayers) {
            if (!NOTIFIABLE_PRAYERS.includes(prayer.name)) continue
            if (!perPrayer[prayer.name]) continue

            const prayerDate = timeToDate(prayer.time)
            if (!prayerDate) continue

            const delay = prayerDate.getTime() - now
            if (delay < 0 || delay > 24 * 60 * 60 * 1000) continue // skip past prayers or >24h

            const timerId = setTimeout(() => {
                try {
                    const notif = new Notification(`حان وقت صلاة ${PRAYER_NAMES_AR[prayer.name]}`, {
                        body: `الوقت: ${prayer.time} — لا تنسَ صلاتك 🕌`,
                        icon: '/logo.svg',
                        badge: '/logo.svg',
                        tag: `prayer-${prayer.name}`,
                        renotify: true,
                        dir: 'rtl',
                        lang: 'ar',
                    })
                    // Auto-close after 30s
                    setTimeout(() => notif.close(), 30_000)
                } catch { /* Notification may fail in some contexts */ }
            }, delay)

            timersRef.current.push(timerId)
        }

        return () => {
            timersRef.current.forEach(clearTimeout)
            timersRef.current = []
        }
    }, [enabled, perPrayer, prayers])

    return {
        enabled,
        setEnabled,
        perPrayer,
        togglePrayer,
        permissionStatus,
        notifiablePrayers: NOTIFIABLE_PRAYERS,
        prayerNamesAr: PRAYER_NAMES_AR,
    }
}

export default usePrayerNotifications
