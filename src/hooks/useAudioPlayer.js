import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'

/* ── Reciters ─────────────────────────────────────────────── */
export const RECITERS = [
    { id: 'ar.alafasy', name: 'مشاري العفاسي' },
    { id: 'ar.husary', name: 'محمود خليل الحصري' },
    { id: 'ar.abdurrahmaansudais', name: 'عبدالرحمن السديس' },
    { id: 'ar.mahermuaiqly', name: 'ماهر المعيقلي' },
    { id: 'ar.minshawi', name: 'محمد صديق المنشاوي' },
    { id: 'ar.saoodshuraym', name: 'سعود الشريم' },
]

const API = 'https://api.alquran.cloud/v1'
const RECITER_KEY = 'quran-reciter-pref'

const readReciterPref = () => {
    try {
        return localStorage.getItem(RECITER_KEY) || RECITERS[0].id
    } catch {
        return RECITERS[0].id
    }
}

/**
 * useAudioPlayer
 *
 * Manages audio playback for a surah — fetches verse-by-verse audio URLs
 * from AlQuran Cloud API and controls an HTML5 Audio element.
 *
 * @param {number} surahNumber
 */
const useAudioPlayer = (surahNumber) => {
    const [reciter, setReciterState] = useState(readReciterPref)
    const [audioAyahs, setAudioAyahs] = useState([]) // [{number, audio}]
    const [currentAyah, setCurrentAyah] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [repeat, setRepeat] = useState(false)
    const [progress, setProgress] = useState(0)
    const [duration, setDuration] = useState(0)
    const [error, setError] = useState('')

    const audioRef = useRef(null)
    const ayahsRef = useRef([])

    // Keep ayahsRef in sync
    useEffect(() => {
        ayahsRef.current = audioAyahs
    }, [audioAyahs])

    /* ── Fetch audio URLs for surah + reciter ──────────────── */
    const fetchAudioData = useCallback(async (edition) => {
        if (!surahNumber || surahNumber < 1) return
        setIsLoading(true)
        setError('')
        try {
            const { data } = await axios.get(
                `${API}/surah/${surahNumber}/${edition}`,
                { timeout: 15_000 },
            )
            const ayahs = data?.data?.ayahs
            if (!Array.isArray(ayahs) || ayahs.length === 0) {
                throw new Error('No audio data')
            }
            const mapped = ayahs.map((a) => ({
                number: a.numberInSurah,
                audio: a.audio,
            }))
            setAudioAyahs(mapped)
        } catch {
            setError('تعذر تحميل التلاوة. تحقق من اتصالك.')
            setAudioAyahs([])
        } finally {
            setIsLoading(false)
        }
    }, [surahNumber])

    // Fetch on mount and when reciter or surah changes
    useEffect(() => {
        fetchAudioData(reciter)
        // Stop any playing audio on surah/reciter change
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current = null
        }
        setIsPlaying(false)
        setCurrentAyah(null)
        setProgress(0)
        setDuration(0)
    }, [reciter, surahNumber, fetchAudioData])

    /* ── Change reciter ────────────────────────────────────── */
    const setReciter = useCallback((id) => {
        try { localStorage.setItem(RECITER_KEY, id) } catch { /* silent */ }
        setReciterState(id)
    }, [])

    /* ── Play specific ayah ────────────────────────────────── */
    const playAyah = useCallback((ayahNumber) => {
        const ayah = ayahsRef.current.find((a) => a.number === ayahNumber)
        if (!ayah?.audio) return

        // Stop current audio
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.removeAttribute('src')
        }

        const audio = new Audio(ayah.audio)
        audioRef.current = audio
        setCurrentAyah(ayahNumber)
        setProgress(0)
        setDuration(0)

        audio.addEventListener('loadedmetadata', () => {
            setDuration(audio.duration)
        })

        audio.addEventListener('timeupdate', () => {
            setProgress(audio.currentTime)
        })

        audio.addEventListener('ended', () => {
            if (repeat) {
                audio.currentTime = 0
                audio.play().catch(() => { })
                return
            }
            // Auto-advance
            const idx = ayahsRef.current.findIndex((a) => a.number === ayahNumber)
            if (idx >= 0 && idx < ayahsRef.current.length - 1) {
                playAyah(ayahsRef.current[idx + 1].number)
            } else {
                setIsPlaying(false)
                setCurrentAyah(null)
            }
        })

        audio.addEventListener('error', () => {
            setIsPlaying(false)
            setError('خطأ في تشغيل الصوت')
        })

        audio.play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false))
    }, [repeat])

    /* ── Toggle play/pause ─────────────────────────────────── */
    const togglePlay = useCallback(() => {
        if (!audioRef.current) {
            // Start from beginning or first ayah
            if (ayahsRef.current.length > 0) {
                playAyah(ayahsRef.current[0].number)
            }
            return
        }

        if (audioRef.current.paused) {
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(() => { })
        } else {
            audioRef.current.pause()
            setIsPlaying(false)
        }
    }, [playAyah])

    /* ── Skip previous / next ──────────────────────────────── */
    const skipPrev = useCallback(() => {
        if (!currentAyah || ayahsRef.current.length === 0) return
        const idx = ayahsRef.current.findIndex((a) => a.number === currentAyah)
        if (idx > 0) playAyah(ayahsRef.current[idx - 1].number)
    }, [currentAyah, playAyah])

    const skipNext = useCallback(() => {
        if (!currentAyah || ayahsRef.current.length === 0) return
        const idx = ayahsRef.current.findIndex((a) => a.number === currentAyah)
        if (idx >= 0 && idx < ayahsRef.current.length - 1) {
            playAyah(ayahsRef.current[idx + 1].number)
        }
    }, [currentAyah, playAyah])

    /* ── Stop ───────────────────────────────────────────────── */
    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.removeAttribute('src')
            audioRef.current = null
        }
        setIsPlaying(false)
        setCurrentAyah(null)
        setProgress(0)
        setDuration(0)
    }, [])

    /* ── Cleanup on unmount ────────────────────────────────── */
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.removeAttribute('src')
                audioRef.current = null
            }
        }
    }, [])

    return {
        reciter,
        setReciter,
        currentAyah,
        isPlaying,
        isLoading,
        repeat,
        setRepeat,
        progress,
        duration,
        error,
        togglePlay,
        playAyah,
        skipPrev,
        skipNext,
        stop,
        hasAudio: audioAyahs.length > 0,
    }
}

export default useAudioPlayer
