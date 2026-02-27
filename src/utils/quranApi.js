import axios from 'axios'
import { quranOfflineSurahs } from '../data/quranOfflineSample'
import { surahs as bundledSurahs } from '../data/quranSample'

/**
 * quranApi.js – Quran data layer
 *
 * Strategy:
 *   1. Always try the live API first (online → real content).
 *   2. On success → persist full surah to localStorage for offline use.
 *   3. On failure → serve localStorage cache, then bundled file.
 *   4. The bundled quranSample.js has ALL 114 surahs with real text,
 *      so the app works fully offline out-of-the-box.
 *   5. Expose `downloadAllSurahs()` to refresh localStorage from API.
 *
 * Edition used: "quran-uthmani" (Uthmani script Arabic text).
 */

const API = 'https://api.alquran.cloud/v1'

// ── Cache keys (v4 = clean slate, ignoring old placeholders) ─
const SURAHS_KEY = 'quran-surahs-v4'
const SURAH_PREFIX = 'quran-surah-v4:'

/* ── localStorage helpers ─────────────────────────────────── */

const readCache = (key) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const writeCache = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    /* Private-mode / quota – silently ignore */
  }
}

/* ── Mappers ──────────────────────────────────────────────── */

const mapRevelation = (type) => {
  if (type === 'Meccan') return 'مكية'
  if (type === 'Medinan') return 'مدنية'
  return type ?? 'غير محدد'
}

const mapSurahSummary = (s) => ({
  number: s.number,
  nameArabic: s.name,
  revelationPlace: mapRevelation(s.revelationType),
  ayahCount: s.numberOfAyahs,
})

const mapSurahDetail = (surah) => ({
  number: surah.number,
  nameArabic: surah.name,
  revelationPlace: mapRevelation(surah.revelationType),
  ayahs: surah.ayahs.map((a) => ({
    number: a.numberInSurah,
    text: a.text,
  })),
})

/* ── Validate a cached surah has real Arabic text ─────────── */

const hasRealText = (surah) => {
  if (!surah?.ayahs?.length) return false
  const first = surah.ayahs[0]?.text ?? ''
  return first.length > 0 && !first.includes('(عنصر بديل)')
}

/* ── Surah list (114 surahs metadata) ─────────────────────── */

export const fetchQuranSurahs = async () => {
  try {
    const { data } = await axios.get(`${API}/surah`, { timeout: 10_000 })
    const surahs = data?.data
    if (!Array.isArray(surahs) || surahs.length === 0) throw new Error()

    const mapped = surahs.map(mapSurahSummary)
    writeCache(SURAHS_KEY, mapped)
    return mapped
  } catch {
    /* Offline → cached list */
    const cached = readCache(SURAHS_KEY)
    if (Array.isArray(cached) && cached.length > 0) return cached

    /* Ultimate fallback */
    return MINIMAL_SURAHS
  }
}

/* ── Single surah – full ayah text ────────────────────────── */

export const fetchSurahByNumber = async (number) => {
  const key = `${SURAH_PREFIX}${number}`

  /* 1. Always try the API first for real content */
  try {
    const { data } = await axios.get(
      `${API}/surah/${number}/quran-uthmani`,
      { timeout: 15_000 },
    )
    const surah = data?.data
    if (!surah?.ayahs?.length) throw new Error()

    const mapped = mapSurahDetail(surah)
    writeCache(key, mapped)          // persist for offline
    return mapped
  } catch {
    /* 2. API unavailable → return localStorage cache */
    const cached = readCache(key)
    if (hasRealText(cached)) return cached

    /* 3. Bundled full Quran from quranSample.js */
    const bundled = getBundledSurah(Number(number))
    if (bundled) return bundled

    /* 4. Nothing available at all */
    throw new Error(
      'لا يوجد اتصال بالإنترنت ولم يتم تخزين هذه السورة بعد.',
    )
  }
}

/* ── Offline download helpers ─────────────────────────────── */

/**
 * How many surahs are stored locally with real text.
 */
export const getCachedSurahCount = () => {
  let count = 0
  for (let i = 1; i <= 114; i++) {
    if (hasRealText(readCache(`${SURAH_PREFIX}${i}`))) count++
  }
  return count
}

/**
 * Download all 114 surahs sequentially and cache each one.
 * @param {(p:{available:number,total:number,current:number})=>void} onProgress
 * @param {{signal?:AbortSignal}} opts – pass an AbortSignal to cancel
 * @returns {Promise<number>} total surahs now locally available
 */
export const downloadAllSurahs = async (onProgress, opts = {}) => {
  const total = 114
  let available = 0

  for (let i = 1; i <= total; i++) {
    if (opts.signal?.aborted) break

    const key = `${SURAH_PREFIX}${i}`

    /* Already cached with real text → skip */
    if (hasRealText(readCache(key))) {
      available++
      onProgress?.({ available, total, current: i })
      continue
    }

    try {
      const { data } = await axios.get(
        `${API}/surah/${i}/quran-uthmani`,
        { timeout: 20_000 },
      )
      const surah = data?.data
      if (surah?.ayahs?.length) {
        writeCache(key, mapSurahDetail(surah))
        available++
      }
    } catch {
      /* skip failed – will retry next time */
    }

    onProgress?.({ available, total, current: i })

    /* Rate-limit gap */
    if (i < total) await new Promise((r) => setTimeout(r, 250))
  }

  return available
}

/* ── Bundled surah lookup (full text from quranSample.js) ── */

const getBundledSurah = (number) => {
  const s = bundledSurahs.find((item) => item.number === number)
  if (!s?.ayahs?.length) return null
  return {
    number: s.number,
    nameArabic: s.nameArabic,
    revelationPlace: s.revelationPlace,
    ayahs: s.ayahs,
  }
}

/* ── Offline fallback – all 114 surahs metadata ───────────── */

const MINIMAL_SURAHS = quranOfflineSurahs