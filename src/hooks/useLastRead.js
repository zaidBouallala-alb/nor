import { useCallback, useMemo } from 'react'

const STORAGE_KEY = 'quran-last-read-v1'

/**
 * Reads / writes last-read bookmark from localStorage.
 * Shape: { surahNumber, ayahNumber, timestamp }
 */

const readBookmark = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const writeBookmark = (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // quota / private mode
  }
}

const useLastRead = (surahNumber) => {
  // Re-read on every surah change so bookmark stays in sync.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const bookmark = useMemo(() => readBookmark(), [surahNumber])

  // Is the stored bookmark for THIS surah?
  const lastReadAyah =
    bookmark && bookmark.surahNumber === surahNumber ? bookmark.ayahNumber : null

  const saveLastRead = useCallback(
    (ayahNumber) => {
      writeBookmark({
        surahNumber,
        ayahNumber,
        timestamp: Date.now(),
      })
    },
    [surahNumber],
  )

  return { lastReadAyah, bookmark, saveLastRead }
}

export default useLastRead
