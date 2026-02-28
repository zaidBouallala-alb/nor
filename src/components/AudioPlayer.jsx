import { useState } from 'react'
import { RECITERS } from '../hooks/useAudioPlayer'

const arabicNum = new Intl.NumberFormat('ar')

/**
 * AudioPlayer — sticky bottom bar for Quran audio recitation.
 *
 * Props:
 *   player  — return value from useAudioPlayer hook
 */
const AudioPlayer = ({ player }) => {
    const [showReciterMenu, setShowReciterMenu] = useState(false)

    if (!player.hasAudio && !player.isLoading) return null

    /* ── Loading state ─────────────────────────────────────── */
    if (player.isLoading) {
        return (
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-surface/95 px-4 py-3 backdrop-blur-md lg:ps-sidebar">
                <div className="mx-auto flex max-w-3xl items-center justify-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-500" />
                    <span className="text-xs text-textMuted">جارٍ تحميل التلاوة...</span>
                </div>
            </div>
        )
    }

    const progressPercent = player.duration > 0 ? (player.progress / player.duration) * 100 : 0
    const currentReciter = RECITERS.find((r) => r.id === player.reciter)

    return (
        <>
            {/* Spacer so content doesn't hide behind sticky player */}
            <div className="h-28 sm:h-20" />

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-surface/95 backdrop-blur-md lg:ps-sidebar">
                {/* Progress bar */}
                <div className="h-1 w-full bg-surface-soft">
                    <div
                        className="h-full bg-gold-500 transition-[width] duration-200"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                <div className="mx-auto max-w-3xl px-4 py-2.5">
                    {/* Error */}
                    {player.error && (
                        <p className="mb-2 text-center text-xs text-rose-300">{player.error}</p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        {/* Left: Now playing info */}
                        <div className="flex items-center gap-2 text-xs text-textMuted">
                            {player.currentAyah ? (
                                <>
                                    <span className="text-gold-300 font-semibold">
                                        آية {arabicNum.format(player.currentAyah)}
                                    </span>
                                    <span className="text-border">•</span>
                                </>
                            ) : null}
                            <span>{currentReciter?.name || 'قارئ'}</span>
                        </div>

                        {/* Center: Transport controls */}
                        <div className="flex items-center gap-1">
                            {/* Skip prev */}
                            <button
                                type="button"
                                onClick={player.skipPrev}
                                aria-label="الآية السابقة"
                                className="rounded-lg p-2 text-textMuted transition hover:bg-white/5 hover:text-slate-100"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061A1.125 1.125 0 0 1 21 8.689v8.122ZM11.25 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061a1.125 1.125 0 0 1 1.683.977v8.122Z" />
                                </svg>
                            </button>

                            {/* Play / Pause */}
                            <button
                                type="button"
                                onClick={player.togglePlay}
                                aria-label={player.isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-background transition hover:bg-gold-400 active:scale-95"
                            >
                                {player.isPlaying ? (
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                            </button>

                            {/* Skip next */}
                            <button
                                type="button"
                                onClick={player.skipNext}
                                aria-label="الآية التالية"
                                className="rounded-lg p-2 text-textMuted transition hover:bg-white/5 hover:text-slate-100"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
                                </svg>
                            </button>

                            {/* Stop */}
                            <button
                                type="button"
                                onClick={player.stop}
                                aria-label="إيقاف"
                                className="rounded-lg p-2 text-textMuted transition hover:bg-white/5 hover:text-slate-100"
                            >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <rect x="6" y="6" width="12" height="12" rx="1" />
                                </svg>
                            </button>

                            {/* Repeat toggle */}
                            <button
                                type="button"
                                onClick={() => player.setRepeat(!player.repeat)}
                                aria-label="تكرار الآية"
                                aria-pressed={player.repeat}
                                className={[
                                    'rounded-lg p-2 transition',
                                    player.repeat
                                        ? 'bg-gold-500/20 text-gold-300'
                                        : 'text-textMuted hover:bg-white/5 hover:text-slate-100',
                                ].join(' ')}
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
                                </svg>
                            </button>
                        </div>

                        {/* Right: Reciter selector */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowReciterMenu((v) => !v)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-surface-soft px-3 py-1.5 text-xs font-medium text-textMuted transition hover:text-slate-100"
                            >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                                </svg>
                                القارئ
                            </button>

                            {showReciterMenu && (
                                <>
                                    {/* Backdrop */}
                                    <button
                                        type="button"
                                        className="fixed inset-0 z-[41]"
                                        aria-label="إغلاق القائمة"
                                        onClick={() => setShowReciterMenu(false)}
                                    />
                                    <div className="absolute bottom-full end-0 z-[42] mb-2 w-56 overflow-hidden rounded-xl border border-border/60 bg-surface shadow-elevated">
                                        <div className="max-h-64 overflow-y-auto py-1">
                                            {RECITERS.map((r) => (
                                                <button
                                                    key={r.id}
                                                    type="button"
                                                    onClick={() => {
                                                        player.setReciter(r.id)
                                                        setShowReciterMenu(false)
                                                    }}
                                                    className={[
                                                        'flex w-full items-center gap-2 px-3 py-2.5 text-sm text-right transition',
                                                        r.id === player.reciter
                                                            ? 'bg-gold-500/15 text-gold-300 font-semibold'
                                                            : 'text-textMuted hover:bg-surface-soft hover:text-slate-100',
                                                    ].join(' ')}
                                                >
                                                    {r.id === player.reciter && (
                                                        <svg className="h-3.5 w-3.5 shrink-0 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                    <span>{r.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AudioPlayer
