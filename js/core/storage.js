// 📄 js/core/storage.js
/**
 * Storage Wrapper
 * Menaxhon ruajtjen e të dhënave në pajisjen e përdoruesit (LocalStorage).
 */
export const storage = {
    // Ruaj të dhëna (kthehen automatikisht në JSON)
    set(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(`hayat_${key}`, serializedValue);
            return true;
        } catch (error) {
            console.error('Error saving to storage:', error);
            return false;
        }
    },

    // Merr të dhëna
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(`hayat_${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from storage:', error);
            return defaultValue;
        }
    },

    // Fshi një çelës
    remove(key) {
        localStorage.removeItem(`hayat_${key}`);
    },

    // Fshi gjithçka (për log out / reset)
    clear() {
        // Fshi vetëm çelësat e Hayat
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('hayat_')) {
                localStorage.removeItem(key);
            }
        });
    }
};
