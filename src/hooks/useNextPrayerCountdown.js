import { useEffect, useMemo, useState } from 'react'

const toMinutes = (timeValue) => {
  if (!timeValue || !timeValue.includes(':')) return null
  const [hours, minutes] = timeValue.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  return hours * 60 + minutes
}

const formatRemaining = (minutes) => {
  const safe = Math.max(0, minutes)
  const h = Math.floor(safe / 60)
  const m = safe % 60
  return `${h} س ${m} د`
}

/**
 * Returns the next prayer name, remaining time, and progress fraction (0→1).
 * Progress = how much of the interval between the *previous* prayer and the
 * *next* prayer has elapsed.  0 = just after the previous prayer, 1 = next prayer is now.
 */
const useNextPrayerCountdown = (prayers) => {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 30)
    return () => clearInterval(id)
  }, [])

  const countdown = useMemo(() => {
    const empty = { nextPrayer: 'غير متاح', remaining: '0 س 0 د', progress: 0, remainingMinutes: 0 }
    if (!prayers || prayers.length === 0) return empty

    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    const list = prayers
      .map((p) => ({ ...p, min: toMinutes(p.time) }))
      .filter((p) => p.min !== null)

    if (list.length === 0) return empty

    /* Find the next prayer (first one whose time > current) */
    const nextIdx = list.findIndex((p) => p.min > currentMinutes)
    const isWrapped = nextIdx === -1          // past all prayers → next is tomorrow's first
    const next = isWrapped ? list[0] : list[nextIdx]

    /* Find the previous prayer (the one before `next`) */
    const prevIdx = isWrapped ? list.length - 1 : (nextIdx === 0 ? list.length - 1 : nextIdx - 1)
    const prev = list[prevIdx]

    /* Minutes remaining until next prayer */
    const rawRemaining = next.min > currentMinutes
      ? next.min - currentMinutes
      : 24 * 60 - currentMinutes + next.min

    /* Total interval between prev and next */
    const totalInterval = next.min > prev.min
      ? next.min - prev.min
      : 24 * 60 - prev.min + next.min

    /* Elapsed since prev */
    const elapsed = totalInterval - rawRemaining

    /* Progress: 0 (just started) → 1 (about to arrive) */
    const progress = totalInterval > 0 ? Math.min(1, Math.max(0, elapsed / totalInterval)) : 0

    return {
      nextPrayer: next.name,
      remaining: formatRemaining(rawRemaining),
      remainingMinutes: rawRemaining,
      progress,
    }
  }, [now, prayers])

  return countdown
}

export default useNextPrayerCountdown
