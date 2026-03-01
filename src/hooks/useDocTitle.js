import { useEffect } from 'react'

const BASE_TITLE = 'نُور'

/**
 * Sets the document title on mount and restores the base title on unmount.
 * @param {string} pageTitle — Arabic page name, e.g. 'مواقيت الصلاة'
 */
const useDocTitle = (pageTitle) => {
    useEffect(() => {
        const prev = document.title
        document.title = pageTitle ? `${pageTitle} — ${BASE_TITLE}` : `${BASE_TITLE} — رفيقك الإسلامي اليومي`

        return () => {
            document.title = prev
        }
    }, [pageTitle])
}

export default useDocTitle
