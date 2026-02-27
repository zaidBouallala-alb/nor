import axios from 'axios'
import { getPrayerTimesFallback } from '../data/prayerTimesSample'

const PRAYER_ORDER = [
  'Fajr',
  'Sunrise',
  'Dhuhr',
  'Asr',
  'Maghrib',
  'Isha',
]

const cleanTimeValue = (value) => value.replace(/\s*\([^)]*\)/g, '').trim()

const mapAladhanData = (
  payload,
  { city = 'Cairo', country = 'Unknown', source = 'AlAdhan API' } = {},
) => {
  const data = payload?.data
  if (!data?.timings) {
    return getPrayerTimesFallback(city)
  }

  return {
    city,
    country,
    source,
    date: data.date?.readable ?? new Date().toLocaleDateString(),
    timezone: data.meta?.timezone ?? 'UTC',
    prayers: PRAYER_ORDER.map((name) => ({
      name,
      time: cleanTimeValue(data.timings[name] ?? '--:--'),
    })),
  }
}

export const fetchPrayerTimesByCity = async ({ city, country }) => {
  try {
    const response = await axios.get('https://api.aladhan.com/v1/timingsByCity', {
      params: {
        city,
        country,
        method: 5,
      },
    })

    return mapAladhanData(response.data, {
      city,
      country,
      source: 'AlAdhan API',
    })
  } catch {
    return getPrayerTimesFallback(city)
  }
}

export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      'https://nominatim.openstreetmap.org/reverse',
      {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'jsonv2',
          'accept-language': 'ar',
        },
        headers: { Accept: 'application/json' },
      },
    )

    const addr = response.data?.address ?? {}
    const city =
      addr.city ?? addr.town ?? addr.village ?? addr.county ?? addr.state ?? ''
    const country = addr.country ?? ''

    if (city && country) return { city, country, label: `${city}، ${country}` }
    if (city) return { city, country, label: city }
    if (country) return { city: country, country, label: country }

    return null
  } catch {
    return null
  }
}

export const fetchPrayerTimesByCoordinates = async ({ latitude, longitude, placeLabel }) => {
  try {
    // Run prayer-time fetch and reverse-geocode in parallel
    const [response, geo] = await Promise.all([
      axios.get('https://api.aladhan.com/v1/timings', {
        params: { latitude, longitude, method: 5 },
      }),
      reverseGeocode(latitude, longitude),
    ])

    const cityName = geo?.label || placeLabel || 'موقعي الحالي'
    const countryName = geo?.country || ''

    return mapAladhanData(response.data, {
      city: cityName,
      country: countryName,
      source: 'AlAdhan API',
    })
  } catch {
    return getPrayerTimesFallback(placeLabel)
  }
}

export const geocodePlace = async (placeQuery) => {
  const response = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: {
      q: placeQuery,
      format: 'jsonv2',
      limit: 1,
    },
    headers: {
      Accept: 'application/json',
    },
  })

  const firstResult = response.data?.[0]

  if (!firstResult) {
    throw new Error('Place not found')
  }

  return {
    latitude: Number(firstResult.lat),
    longitude: Number(firstResult.lon),
    label: firstResult.display_name,
  }
}
