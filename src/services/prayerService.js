import { get, set } from './storage/idb';

const getCacheKey = (city) => `prayers:${city.toLowerCase()}:v1`;

/**
 * Loads monthly prayer times for a given city from IDB.
 * @param {string} city - Target city name
 * @returns {Promise<Object|null>} Normalized prayer times
 */
export const load = async (city) => {
    try {
        const cached = await get(getCacheKey(city), { store: 'app_cache' });
        return cached || null;
    } catch {
        return null;
    }
};

/**
 * Forces a network fetch for a city and updates IDB caching.
 * @param {string} city - Target city name
 * @returns {Promise<Object|null>} Fresh payload
 */
export const refresh = async (city) => {
    try {
        const payload = { city, timings: {} }; // TODO: Replace with AlAdhan integration
        await set(getCacheKey(city), payload, { store: 'app_cache' });
        return payload;
    } catch {
        return null;
    }
};

/**
 * Validates existence of current active prayer cache.
 * @param {string} city - Target city name
 * @returns {Promise<{cached: boolean, source: 'idb'|'network'|'none'}>}
 */
export const getCachedStatus = async (city) => {
    const cached = await get(getCacheKey(city), { store: 'app_cache' });
    return { cached: !!cached, source: cached ? 'idb' : 'none' };
};
