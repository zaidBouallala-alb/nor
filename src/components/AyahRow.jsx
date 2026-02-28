import { memo, forwardRef } from 'react'

const arabicNum = new Intl.NumberFormat('ar')

/**
 * Inline ayah span — renders as part of a continuous flowing paragraph
 * like a traditional mushaf. Click to bookmark. Play icon to start audio.
 */
const AyahRow = memo(
  forwardRef(function AyahRow(
    { ayah, isLastRead, isPlaying, onSelect, onPlay },
    ref,
  ) {
    return (
      <span
        ref={ref}
        role="button"
        tabIndex={0}
        onClick={() => onSelect(ayah.number)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect(ayah.number)
          }
        }}
        aria-label={`آية ${ayah.number}`}
        aria-current={isLastRead ? 'true' : undefined}
        className={[
          'cursor-pointer rounded-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
          isPlaying
            ? 'bg-gold-500/20 px-0.5 ring-1 ring-gold-500/30'
            : isLastRead
              ? 'bg-gold-500/15 px-0.5'
              : 'hover:bg-white/[0.04]',
        ].join(' ')}
      >
        {ayah.text ?? ''}
        {/* Ayah end marker ﴿١﴾ */}
        <span
          className="mx-1 inline-block text-gold-500/70"
          style={{ fontSize: '0.72em' }}
          aria-hidden="true"
        >
          ﴿{arabicNum.format(ayah.number)}﴾
        </span>
        {/* Play button — only show on hover/focus if onPlay is provided */}
        {onPlay && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onPlay(ayah.number)
            }}
            aria-label={`تشغيل آية ${ayah.number}`}
            className={[
              'inline-flex h-5 w-5 items-center justify-center rounded-full align-middle transition-all',
              isPlaying
                ? 'bg-gold-500 text-background scale-100'
                : 'bg-transparent text-gold-500/0 hover:bg-gold-500/20 hover:text-gold-400 hover:scale-100 scale-75',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
            ].join(' ')}
            style={{ fontSize: '0.6em' }}
          >
            {isPlaying ? (
              <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        )}
      </span>
    )
  }),
)

AyahRow.displayName = 'AyahRow'

export default AyahRow
