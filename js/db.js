/**
 * 🕋 Hayat - Islamic Life Manager PWA
 * 🗄️ IndexedDB Wrapper (Për data të rënda si Namazi, Kur'ani, Detyrat)
 */

const DB_NAME = 'HayatDB';
const DB_VERSION = 2; // Versioni 2: Shtuar tabelat për Modulin e Kur'anit

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

                // --- FAZA 1 & 2 ---
                
                // Tabela për Log-un e Namazit (Key: data, p.sh. "2026-07-15")
                if (!db.objectStoreNames.contains('prayer_logs')) {
                    db.createObjectStore('prayer_logs', { keyPath: 'date' });
                }

                // Tabela për Detyrat (To-Do List) (Key: id unike)
                if (!db.objectStoreNames.contains('tasks')) {
                    const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
                    taskStore.createIndex('date', 'due_date', { unique: false });
                }

                // Tabela e vjetër për Historinë e Kur'anit (E mbajmë për siguri të dhënash)
                if (!db.objectStoreNames.contains('quran_progress')) {
                    db.createObjectStore('quran_progress', { keyPath: 'surah_id' });
                }

                // --- FAZA 3: Moduli i Kur'anit ---

                // 📖 1. Tabela për Faqeshënuesit (Bookmarks) dhe Leximin e Fundit
                if (!db.objectStoreNames.contains('quran_bookmarks')) {
                    const bookmarksStore = db.createObjectStore('quran_bookmarks', { keyPath: 'id', autoIncrement: true });
                    bookmarksStore.createIndex('type', 'type', { unique: false }); // 'last_read' ose 'favorite'
                    bookmarksStore.createIndex('surah', 'surah', { unique: false });
                    bookmarksStore.createIndex('ayah', 'ayah', { unique: false });
                    bookmarksStore.createIndex('page', 'page', { unique: false });
                }

                // 🧠 2. Tabela për Progresin e Hifdhit (Memorizimit)
                if (!db.objectStoreNames.contains('hifdh_progress')) {
                    const hifdhStore = db.createObjectStore('hifdh_progress', { keyPath: 'ayah_key' }); // Formati "1_1" (Surja_Ajeti)
                    hifdhStore.createIndex('surah', 'surah', { unique: false });
                    hifdhStore.createIndex('status', 'status', { unique: false }); // 'learning', 'memorized', 'needs_revision'
                    hifdhStore.createIndex('last_reviewed', 'last_reviewed', { unique: false }); 
                }

                // ⚙️ 3. Tabela për Cilësimet e Kur'anit
                if (!db.objectStoreNames.contains('quran_settings')) {
                    db.createObjectStore('quran_settings', { keyPath: 'setting_name' });
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
