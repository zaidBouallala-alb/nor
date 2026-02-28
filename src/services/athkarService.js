import { get, set } from './storage/idb';

const CACHE_KEY = 'athkar:v1';

/**
 * Loads complete daily Athkar payload from IDB cache.
 * @returns {Promise<Array|null>} Array of athkar categories
 */
export const load = async () => {
    try {
        const cached = await get(CACHE_KEY, { store: 'app_cache' });
        return cached || null; // Return bundled fallback if null later
    } catch {
        return null;
    }
};

/**
 * Refresh Athkar from remote source and update offline cache.
 * @returns {Promise<Array|null>}
 */
export const refresh = async () => {
    try {
        const payload = []; // TODO: implement fetch
        await set(CACHE_KEY, payload, { store: 'app_cache' });
        return payload;
    } catch {
        return null;
    }
};

/**
 * Evaluates current availability of Athkar library.
 * @returns {Promise<{cached: boolean, source: 'idb'|'none'}>}
 */
export const getCachedStatus = async () => {
    const cached = await get(CACHE_KEY, { store: 'app_cache' });
    return { cached: !!cached, source: cached ? 'idb' : 'none' };
};
