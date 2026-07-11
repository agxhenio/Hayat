/**
 * Core Storage Module (storage.js)
 * Menaxhimi i të dhënave lokale (LocalStorage Wrapper)
 */

export const Storage = {
  /**
   * Ruaj të dhëna në LocalStorage
   * @param {string} key 
   * @param {any} value 
   */
  set(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(`hayat_${key}`, serializedValue);
    } catch (error) {
      console.error(`[Storage] Error saving key "${key}":`, error);
    }
  },

  /**
   * Merr të dhëna nga LocalStorage
   * @param {string} key 
   * @param {any} defaultValue 
   * @returns {any}
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(`hayat_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`[Storage] Error reading key "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * Fshi një çelës specifik
   * @param {string} key 
   */
  remove(key) {
    localStorage.removeItem(`hayat_${key}`);
  },

  /**
   * Fshi të gjitha të dhënat (për Logout / Reset)
   */
  clear() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('hayat_')) {
        localStorage.removeItem(key);
      }
    });
  }
};
