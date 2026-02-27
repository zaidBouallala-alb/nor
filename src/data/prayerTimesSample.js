const fallbackByCity = {
  cairo: {
    city: 'Cairo',
    country: 'Egypt',
    source: 'Fallback',
    date: '2026-02-27',
    timezone: 'Africa/Cairo',
    prayers: [
      { name: 'Fajr', time: '05:03' },
      { name: 'Sunrise', time: '06:30' },
      { name: 'Dhuhr', time: '12:10' },
      { name: 'Asr', time: '15:35' },
      { name: 'Maghrib', time: '17:52' },
      { name: 'Isha', time: '19:10' },
    ],
  },
  mecca: {
    city: 'Makkah',
    country: 'Saudi Arabia',
    source: 'Fallback',
    date: '2026-02-27',
    timezone: 'Asia/Riyadh',
    prayers: [
      { name: 'Fajr', time: '05:24' },
      { name: 'Sunrise', time: '06:40' },
      { name: 'Dhuhr', time: '12:33' },
      { name: 'Asr', time: '15:54' },
      { name: 'Maghrib', time: '18:25' },
      { name: 'Isha', time: '19:40' },
    ],
  },
  istanbul: {
    city: 'Istanbul',
    country: 'Turkey',
    source: 'Fallback',
    date: '2026-02-27',
    timezone: 'Europe/Istanbul',
    prayers: [
      { name: 'Fajr', time: '06:09' },
      { name: 'Sunrise', time: '07:32' },
      { name: 'Dhuhr', time: '13:23' },
      { name: 'Asr', time: '16:32' },
      { name: 'Maghrib', time: '19:03' },
      { name: 'Isha', time: '20:22' },
    ],
  },
}

export const prayerTimesSample = fallbackByCity.cairo

export const getPrayerTimesFallback = (cityName = '') => {
  const key = cityName.trim().toLowerCase()
  return fallbackByCity[key] ?? prayerTimesSample
}
