const CACHE_KEY = 'tasbih_counters:v1';

/**
 * Loads small user settings synchronously from standard localStorage.
 * @returns {Object|null} User's raw counters
 */
export const load = () => {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        // Quota blocked / Safari private mode
        return null;
    }
};

/**
 * Overwrites the entire tasbih payload string directly to localStorage.
 * Note: Synchronous, unlike IDB variants.
 * @param {Object} payload - Serialized target counts
 * @returns {Object|null}
 */
export const refresh = (payload) => {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
        return payload;
    } catch {
        console.warn('[Storage Error] Unable to persist Tasbih counters.');
        return null;
    }
};

/**
 * Polls for valid existence of counters inside localStorage limits.
 * @returns {{cached: boolean, source: 'local'|'none'}}
 */
export const getCachedStatus = () => {
    const isCached = !!load();
    return { cached: isCached, source: isCached ? 'local' : 'none' };
};
