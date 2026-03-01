import axios from 'axios'
import { quranOfflineSurahs } from '../data/quranOfflineSample'
import { get, set } from '../services/storage/idb'

/* bundledSurahs is loaded lazily via dynamic import() below —
   this keeps the 1.6 MB file out of the initial bundle. */
let _bundledSurahsCache = null
const loadBundledSurahs = async () => {
  if (_bundledSurahsCache) return _bundledSurahsCache
  const mod = await import('../data/quranSample')
  _bundledSurahsCache = mod.surahs
  return _bundledSurahsCache
}

/**
 * quranApi.js – Quran data layer
 *
 * Storage: IndexedDB (via idb.js helper) — supports 50MB+ vs localStorage's 5MB.
 *
 * Strategy:
 *   1. Always try the live API first (online → real content).
 *   2. On success → persist full surah to IndexedDB for offline use.
 *   3. On failure → serve IndexedDB cache, then bundled file.
 *   4. The bundled quranSample.js has ALL 114 surahs with real text,
 *      so the app works fully offline out-of-the-box.
 *   5. Expose `downloadAllSurahs()` to refresh IndexedDB from API.
 *
 * Edition used: "quran-uthmani" (Uthmani script Arabic text).
 */

const API = 'https://api.alquran.cloud/v1'

// ── Cache keys (v5 = IndexedDB migration) ─
const SURAHS_KEY = 'quran-surahs-v5'
const SURAH_PREFIX = 'quran-surah-v5:'
const IDB_STORE = 'app_cache'

/* ── IndexedDB helpers with localStorage fallback ─────────── */

const readCache = async (key) => {
  try {
    // Try IndexedDB first
    const idbResult = await get(key, { store: IDB_STORE })
    if (idbResult) return idbResult

    // Fallback: migrate from old localStorage if exists
    const raw = localStorage.getItem(key.replace('-v5', '-v4'))
    if (raw) {
      const parsed = JSON.parse(raw)
      // Migrate to IDB and clean up localStorage
      await set(key, parsed, { store: IDB_STORE })
      localStorage.removeItem(key.replace('-v5', '-v4'))
      return parsed
    }
    return null
  } catch {
    return null
  }
}

const writeCache = async (key, data) => {
  try {
    await set(key, data, { store: IDB_STORE })
  } catch {
    /* Private-mode / quota – silently ignore */
  }
}

/* ── Retry with exponential backoff ──────────────────────── */

const fetchWithRetry = async (url, { maxRetries = 3, timeout = 15000 } = {}) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { data } = await axios.get(url, { timeout })
      return data
    } catch (err) {
      if (attempt === maxRetries - 1) throw err
      // Exponential backoff: 1s, 2s
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
    }
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
    const data = await fetchWithRetry(`${API}/surah`, { timeout: 10_000 })
    const surahs = data?.data
    if (!Array.isArray(surahs) || surahs.length === 0) throw new Error()

    const mapped = surahs.map(mapSurahSummary)
    await writeCache(SURAHS_KEY, mapped)
    return mapped
  } catch {
    /* Offline → cached list */
    const cached = await readCache(SURAHS_KEY)
    if (Array.isArray(cached) && cached.length > 0) return cached

    /* Ultimate fallback */
    return MINIMAL_SURAHS
  }
}

/* ── Single surah – full ayah text ────────────────────────── */

export const fetchSurahByNumber = async (number) => {
  const key = `${SURAH_PREFIX}${number}`

  /* 1. Always try the API first for real content (with retries) */
  try {
    const data = await fetchWithRetry(
      `${API}/surah/${number}/quran-uthmani`,
      { timeout: 15_000, maxRetries: 2 },
    )
    const surah = data?.data
    if (!surah?.ayahs?.length) throw new Error()

    const mapped = mapSurahDetail(surah)
    await writeCache(key, mapped)          // persist for offline
    return mapped
  } catch {
    /* 2. API unavailable → return IndexedDB cache */
    const cached = await readCache(key)
    if (hasRealText(cached)) return cached

    /* 3. Bundled full Quran from quranSample.js */
    const bundled = await getBundledSurah(Number(number))
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
export const getCachedSurahCount = async () => {
  let count = 0
  for (let i = 1; i <= 114; i++) {
    const cached = await readCache(`${SURAH_PREFIX}${i}`)
    if (hasRealText(cached)) count++
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
    const existing = await readCache(key)
    if (hasRealText(existing)) {
      available++
      onProgress?.({ available, total, current: i })
      continue
    }

    try {
      const data = await fetchWithRetry(
        `${API}/surah/${i}/quran-uthmani`,
        { timeout: 20_000, maxRetries: 2 },
      )
      const surah = data?.data
      if (surah?.ayahs?.length) {
        await writeCache(key, mapSurahDetail(surah))
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

const getBundledSurah = async (number) => {
  try {
    const bundledSurahs = await loadBundledSurahs()
    const s = bundledSurahs.find((item) => item.number === number)
    if (!s?.ayahs?.length) return null
    return {
      number: s.number,
      nameArabic: s.nameArabic,
      revelationPlace: s.revelationPlace,
      ayahs: s.ayahs,
    }
  } catch {
    return null
  }
}

/* ── Offline fallback – all 114 surahs metadata ───────────── */

const MINIMAL_SURAHS = quranOfflineSurahs