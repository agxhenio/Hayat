/**
 * 🕋 Hayat - Islamic Life Manager PWA
 * 🗄️ IndexedDB Wrapper (Për data të rënda si Namazi, Kur'ani, Detyrat)
 */

const DB_NAME = 'HayatDB';
const DB_VERSION = 1;

const HayatDB = {
    db: null,

    // Inicializimi i Bazës së të Dhënave
    init: function() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                console.warn("IndexedDB nuk suportohet nga ky browser. Të dhënat mund të mos ruhen.");
                reject("IndexedDB not supported");
                return;
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error("Gabim në hapjen e HayatDB", event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log("HayatDB u inicializua me sukses.");
                resolve(this.db);
            };

            // Krijimi i strukturave (Store-ve) nëse nuk ekzistojnë ose ka version të ri
            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Tabela për Log-un e Namazit (Key: data, p.sh. "2026-07-15")
                if (!db.objectStoreNames.contains('prayer_logs')) {
                    db.createObjectStore('prayer_logs', { keyPath: 'date' });
                }

                // Tabela për Detyrat (To-Do List) (Key: id unike)
                if (!db.objectStoreNames.contains('tasks')) {
                    const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
                    taskStore.createIndex('date', 'due_date', { unique: false });
                }

                // Tabela për Historinë e Kur'anit dhe Hifdhit
                if (!db.objectStoreNames.contains('quran_progress')) {
                    db.createObjectStore('quran_progress', { keyPath: 'surah_id' });
                }
            };
        });
    },

    // Ruajtja ose Përditësimi i një rekordi
    saveData: function(storeName, data) {
        return new Promise((resolve, reject) => {
            if (!this.db) { reject("Database nuk është gati"); return; }
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data); // 'put' bën insert nëse s'ka, ose update nëse ekziston

            request.onsuccess = () => resolve(true);
            request.onerror = (event) => reject(event.target.error);
        });
    },

    // Marrja e një rekordi specifik nga ID ose Data
    getData: function(storeName, key) {
        return new Promise((resolve, reject) => {
            if (!this.db) { reject("Database nuk është gati"); return; }
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = (event) => resolve(event.target.result || null);
            request.onerror = (event) => reject(event.target.error);
        });
    },

    // Marrja e të gjitha rekordeve nga një tabelë
    getAllData: function(storeName) {
        return new Promise((resolve, reject) => {
            if (!this.db) { reject("Database nuk është gati"); return; }
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = (event) => resolve(event.target.result || []);
            request.onerror = (event) => reject(event.target.error);
        });
    },

    // Fshirja e një rekordi
    deleteData: function(storeName, key) {
        return new Promise((resolve, reject) => {
            if (!this.db) { reject("Database nuk është gati"); return; }
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve(true);
            request.onerror = (event) => reject(event.target.error);
        });
    }
};
