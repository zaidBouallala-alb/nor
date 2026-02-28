const DB_NAME = 'NoorAppDB';
const DB_VERSION = 1;

export const isIdbSupported = () => {
    try {
        return typeof window !== 'undefined' && 'indexedDB' in window;
    } catch {
        return false;
    }
};

const openDB = () => {
    return new Promise((resolve, reject) => {
        if (!isIdbSupported()) return reject(new Error('IndexedDB not supported'));

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('app_cache')) {
                db.createObjectStore('app_cache');
            }
            if (!db.objectStoreNames.contains('user_data')) {
                db.createObjectStore('user_data');
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const withStore = async (storeName, mode, callback) => {
    try {
        const db = await openDB();
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);

        return await new Promise((resolve, reject) => {
            const request = callback(store);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (err) {
        console.warn(`[IDB Warning] degrading gracefully: ${err.message}`);
        return null;
    }
};

export const get = (key, { store = 'app_cache' } = {}) => withStore(store, 'readonly', (s) => s.get(key));
export const set = (key, value, { store = 'app_cache' } = {}) => withStore(store, 'readwrite', (s) => s.put(value, key));
export const del = (key, { store = 'app_cache' } = {}) => withStore(store, 'readwrite', (s) => s.delete(key));
export const clear = ({ store = 'app_cache' } = {}) => withStore(store, 'readwrite', (s) => s.clear());
