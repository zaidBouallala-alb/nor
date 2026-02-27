import { memo, forwardRef } from 'react'

const arabicNum = new Intl.NumberFormat('ar')

/**
 * Inline ayah span — renders as part of a continuous flowing paragraph
 * like a traditional mushaf. Click to bookmark.
 */
const AyahRow = memo(
  forwardRef(function AyahRow(
    { ayah, isLastRead, onSelect },
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
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400',
          isLastRead
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
      </span>
    )
  }),
)

AyahRow.displayName = 'AyahRow'

export default AyahRow
