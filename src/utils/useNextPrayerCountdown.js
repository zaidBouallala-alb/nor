import { useEffect, useMemo, useState } from 'react'

const toMinutes = (timeValue) => {
  if (!timeValue || !timeValue.includes(':')) {
    return null
  }

  const [hours, minutes] = timeValue.split(':').map(Number)

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null
  }

  return hours * 60 + minutes
}

const formatRemaining = (minutes) => {
  const safeMinutes = Math.max(0, minutes)
  const hours = Math.floor(safeMinutes / 60)
  const mins = safeMinutes % 60
  return `${hours} س ${mins} د`
}

const useNextPrayerCountdown = (prayers) => {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timerId = setInterval(() => setNow(new Date()), 1000 * 30)
    return () => clearInterval(timerId)
  }, [])

  const countdown = useMemo(() => {
    if (!prayers || prayers.length === 0) {
      return { nextPrayer: 'غير متاح', remaining: '0 س 0 د' }
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    const prayerWithMinutes = prayers
      .map((prayer) => ({
        ...prayer,
        minuteValue: toMinutes(prayer.time),
      }))
      .filter((prayer) => prayer.minuteValue !== null)

    if (prayerWithMinutes.length === 0) {
      return { nextPrayer: 'غير متاح', remaining: '0 س 0 د' }
    }

    const next =
      prayerWithMinutes.find((prayer) => prayer.minuteValue > currentMinutes) ??
      prayerWithMinutes[0]

    const rawRemaining =
      next.minuteValue > currentMinutes
        ? next.minuteValue - currentMinutes
        : 24 * 60 - currentMinutes + next.minuteValue

    return {
      nextPrayer: next.name,
      remaining: formatRemaining(rawRemaining),
    }
  }, [now, prayers])

  return countdown
}

export default useNextPrayerCountdown
