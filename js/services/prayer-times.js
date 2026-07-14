/**
 * 🕋 Hayat - Islamic Life Manager PWA
 * ⏱️ Prayer Times Service (Aladhan API + Offline Cache)
 */

const PrayerTimesService = {
    // Konfigurimet bazë (Default: Tiranë, MWL, Hanefi)
    config: {
        city: 'Tiranë',
        country: 'Albania',
        latitude: 41.3275,
        longitude: 19.8187,
        method: 3, // 3 = Muslim World League (MWL)
        school: 1  // 1 = Hanefi (Për Ikindinë), 0 = Shafi
    },

    // Emrat e namazeve në Shqip
    prayerNames: {
        Fajr: 'Sabahu',
        Sunrise: 'Lindja',
        Dhuhr: 'Dreka',
        Asr: 'Ikindia',
        Maghrib: 'Akshami',
        Isha: 'Jacia'
    },

    /**
     * Merr kohët e namazit për ditën e sotme (Nga Cache ose API)
     */
    async getTodayTimings() {
        const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const cacheKey = `hayat_prayers_${today}`;

        // 1. Kontrollo nëse i kemi ruajtur offline në localStorage
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
            console.log('[Prayer Service] Kohët u morën nga Cache (Offline)');
            return JSON.parse(cachedData);
        }

        // 2. Nëse s'i kemi, i marrim nga Aladhan API
        try {
            console.log('[Prayer Service] Po marrim kohët nga API...');
            const url = `https://api.aladhan.com/v1/timingsByCity?city=${this.config.city}&country=${this.config.country}&method=${this.config.method}&school=${this.config.school}`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (data.code === 200) {
                const timings = data.data.timings;
                
                // Ruajmë në Cache vetëm ato që na duhen për të kursyer hapësirë
                const essentialTimings = {
                    Fajr: timings.Fajr,
                    Sunrise: timings.Sunrise,
                    Dhuhr: timings.Dhuhr,
                    Asr: timings.Asr,
                    Maghrib: timings.Maghrib,
                    Isha: timings.Isha,
                    hijri: data.data.date.hijri.date,
                    hijri_month: data.data.date.hijri.month.en
                };

                // Ruajmë në localStorage për përdorim offline
                localStorage.setItem(cacheKey, JSON.stringify(essentialTimings));
                return essentialTimings;
            } else {
                throw new Error("Gabim nga API i Aladhan");
            }
        } catch (error) {
            console.error('[Prayer Service] Dështoi marrja e kohëve:', error);
            // Këtu mund të bëjmë fallback te adhan.js nëse do ta integroshim lokalisht
            return null;
        }
    },

    /**
     * Llogarit cili është namazi i kaluar dhe cili është namazi i radhës
     */
    async getCurrentAndNextPrayer() {
        const timings = await this.getTodayTimings();
        if (!timings) return null;

        const now = new Date();
        const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

        // Renditja e namazeve për krahasim
        const schedule = [
            { id: 'Fajr', time: timings.Fajr },
            { id: 'Dhuhr', time: timings.Dhuhr },
            { id: 'Asr', time: timings.Asr },
            { id: 'Maghrib', time: timings.Maghrib },
            { id: 'Isha', time: timings.Isha }
        ];

        let currentPrayer = null;
        let nextPrayer = schedule[0]; // Default: Sabahu i ditës tjetër

        for (let i = 0; i < schedule.length; i++) {
            const prayerTimeParts = schedule[i].time.split(':');
            const prayerTimeInMinutes = parseInt(prayerTimeParts[0]) * 60 + parseInt(prayerTimeParts[1]);

            if (currentTimeInMinutes >= prayerTimeInMinutes) {
                currentPrayer = schedule[i];
                // Përditëso namazin e radhës
                nextPrayer = (i + 1 < schedule.length) ? schedule[i + 1] : { id: 'Fajr_NextDay', time: timings.Fajr };
            }
        }

        return {
            current: currentPrayer ? { id: currentPrayer.id, name: this.prayerNames[currentPrayer.id], time: currentPrayer.time } : null,
            next: { id: nextPrayer.id.replace('_NextDay', ''), name: this.prayerNames[nextPrayer.id.replace('_NextDay', '')], time: nextPrayer.time, isNextDay: nextPrayer.id.includes('_NextDay') }
        };
    },

    /**
     * Përgatit string-un e numërimit mbrapsht (Countdown HH:MM:SS)
     */
    getCountdownTo(targetTimeString, isNextDay = false) {
        const now = new Date();
        const targetParts = targetTimeString.split(':');
        
        let targetDate = new Date();
        targetDate.setHours(parseInt(targetParts[0]), parseInt(targetParts[1]), 0, 0);

        if (isNextDay) {
            targetDate.setDate(targetDate.getDate() + 1);
        }

        const diff = targetDate - now;
        if (diff <= 0) return "00:00:00";

        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);

        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
};
