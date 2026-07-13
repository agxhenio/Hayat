/**
 * Shërbimi i Kohëve të Namazit
 * Përdor adhan.js për llogaritje offline dhe Aladhan API si backup
 */

class PrayerTimesService {
    constructor() {
        this.cacheKey = 'prayer_cache';
        this.configKey = 'prayer_config';
        this.defaultConfig = {
            calculation_method: 3, // Muslim World League
            asr_method: 'hanafi',
            location: {
                city: 'Tiranë',
                country: 'Shqipëri',
                latitude: 41.3275,
                longitude: 19.8187,
                auto_detect: true
            }
        };

        this.init();
    }

    init() {
        // Inicializo konfigurimet nëse nuk ekzistojnë
        if (!localStorage.getItem(this.configKey)) {
            localStorage.setItem(this.configKey, JSON.stringify(this.defaultConfig));
        }
        
        if (!localStorage.getItem(this.cacheKey)) {
            localStorage.setItem(this.cacheKey, JSON.stringify({}));
        }

        this.config = JSON.parse(localStorage.getItem(this.configKey));
        this.cache = JSON.parse(localStorage.getItem(this.cacheKey));
    }

    getConfig() {
        return this.config;
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        localStorage.setItem(this.configKey, JSON.stringify(this.config));
        this.clearCache(); // Fshi cache-in nëse ndryshon lokacioni/metoda
    }

    clearCache() {
        this.cache = {};
        localStorage.setItem(this.cacheKey, JSON.stringify(this.cache));
    }

    // Funksioni kryesor për të marrë kohët e namazit për një ditë
    async getTimesForDate(dateObj = new Date()) {
        const dateStr = this.formatDate(dateObj);

        // Kthe nga cache nëse ekziston
        if (this.cache[dateStr]) {
            return this.cache[dateStr];
        }

        try {
            // Provo me adhan.js (Offline)
            const times = this.calculateWithAdhan(dateObj);
            this.saveToCache(dateStr, times);
            return times;
        } catch (error) {
            console.warn("Llogaritja lokale dështoi, po provojmë API-në...", error);
            try {
                // Backup: Aladhan API
                const times = await this.fetchFromAPI(dateStr);
                this.saveToCache(dateStr, times);
                return times;
            } catch (apiError) {
                console.error("Të dyja metodat dështuan:", apiError);
                return null;
            }
        }
    }

    // Gjenero cache për 7 ditët e ardhshme
    async prefetchWeek() {
        let today = new Date();
        for (let i = 0; i < 7; i++) {
            let nextDate = new Date(today);
            nextDate.setDate(today.getDate() + i);
            await this.getTimesForDate(nextDate);
        }
    }

    calculateWithAdhan(date) {
        if (typeof adhan === 'undefined') {
            throw new Error("Libraria adhan.js nuk është ngarkuar.");
        }

        const coordinates = new adhan.Coordinates(
            this.config.location.latitude, 
            this.config.location.longitude
        );

        // Parametrat: Muslim World League (3)
        let params = adhan.CalculationMethod.MuslimWorldLeague();
        
        // Asr Method
        if (this.config.asr_method === 'hanafi') {
            params.madhab = adhan.Madhab.Hanafi;
        } else {
            params.madhab = adhan.Madhab.Shafi;
        }

        const prayerTimes = new adhan.PrayerTimes(coordinates, date, params);

        return {
            fajr: this.formatTime(prayerTimes.fajr),
            sunrise: this.formatTime(prayerTimes.sunrise),
            dhuhr: this.formatTime(prayerTimes.dhuhr),
            asr: this.formatTime(prayerTimes.asr),
            maghrib: this.formatTime(prayerTimes.maghrib),
            isha: this.formatTime(prayerTimes.isha)
        };
    }

    async fetchFromAPI(dateStr) {
        // dateStr duhet të jetë DD-MM-YYYY për Aladhan API
        const dateParts = dateStr.split('-');
        const apiDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; 

        const url = `https://api.aladhan.com/v1/timings/${apiDate}?latitude=${this.config.location.latitude}&longitude=${this.config.location.longitude}&method=${this.config.calculation_method}&school=${this.config.asr_method === 'hanafi' ? 1 : 0}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.code === 200) {
            const timings = data.data.timings;
            return {
                fajr: timings.Fajr,
                sunrise: timings.Sunrise,
                dhuhr: timings.Dhuhr,
                asr: timings.Asr,
                maghrib: timings.Maghrib,
                isha: timings.Isha
            };
        } else {
            throw new Error("API u përgjigj me gabim.");
        }
    }

    // Përditëso vendndodhjen automatikisht
    async autoDetectLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Gjeolokacioni nuk mbështetet në këtë shfletues."));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.updateConfig({
                        location: {
                            ...this.config.location,
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            auto_detect: true
                        }
                    });
                    this.prefetchWeek(); // Rigjenero kohët me lokacionin e ri
                    resolve(this.config.location);
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000
                }
            );
        });
    }

    /* --- Helpers --- */

    saveToCache(dateStr, times) {
        this.cache[dateStr] = times;
        localStorage.setItem(this.cacheKey, JSON.stringify(this.cache));
    }

    formatDate(date) {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${y}-${m}-${d}`;
    }

    formatTime(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
}

// Eksporto si instancë globale për t'u përdorur në module të tjera
const prayerTimesService = new PrayerTimesService();
