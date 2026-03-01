import { useLocation } from '../context/LocationContext'

const LocationPopup = () => {
    const { showPopup, detectLocation, dismissPopup } = useLocation()

    if (!showPopup) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                onClick={dismissPopup}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="w-full max-w-sm animate-in rounded-2xl border border-border/50 bg-surface p-6 shadow-2xl"
                    style={{ animation: 'popup-in 0.3s ease-out' }}
                >
                    {/* Icon */}
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/15">
                        <svg className="h-8 w-8 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                    </div>

                    {/* Title */}
                    <h2 className="mb-2 text-center text-lg font-bold text-slate-100">
                        تفعيل الموقع الجغرافي
                    </h2>

                    {/* Description */}
                    <p className="mb-6 text-center text-sm leading-relaxed text-textMuted">
                        يحتاج التطبيق إلى موقعك لعرض <span className="font-semibold text-gold-300">مواقيت الصلاة</span> و<span className="font-semibold text-gold-300">اتجاه القبلة</span> بدقة لمنطقتك.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={detectLocation}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 px-4 py-3 text-sm font-bold text-background transition hover:bg-gold-400 active:scale-[0.98]"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                            تفعيل الموقع
                        </button>

                        <button
                            type="button"
                            onClick={dismissPopup}
                            className="w-full rounded-xl border border-border bg-surface-soft px-4 py-2.5 text-sm font-medium text-textMuted transition hover:text-slate-100"
                        >
                            ليس الآن
                        </button>
                    </div>
                </div>
            </div>

            {/* Animation keyframes */}
            <style>{`
        @keyframes popup-in {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
        </>
    )
}

export default LocationPopup
