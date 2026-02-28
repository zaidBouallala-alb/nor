import { get, set } from './storage/idb';

const CACHE_KEY = 'quran:v1';

/**
 * Loads Quran data from IndexedDB cache or fallbacks.
 * Gracefully handles quota errors or private browsing restrictions.
 * @returns {Promise<Object|null>} Normalized Quran data
 */
export const load = async () => {
    try {
        const cached = await get(CACHE_KEY, { store: 'app_cache' });
        if (cached) return cached;

        // TODO: implement bundled/network fallback here
        return null;
    } catch {
        return null;
    }
};

/**
 * Forces a network fetch to refresh full Quran data and updates IDB cache.
 * @returns {Promise<Object|null>} Fetched data explicitly
 */
export const refresh = async () => {
    try {
        // TODO: fetch real API
        const payload = { downloaded: true };
        await set(CACHE_KEY, payload, { store: 'app_cache' });
        return payload;
    } catch {
        return null;
    }
};

/**
 * Returns the origin source and availability of the cached Quran data.
 * @returns {Promise<{cached: boolean, source: 'bundled'|'idb'|'network'|'none'}>}
 */
export const getCachedStatus = async () => {
    const cached = await get(CACHE_KEY, { store: 'app_cache' });
    return {
        cached: !!cached,
        source: cached ? 'idb' : 'none'
    };
};
