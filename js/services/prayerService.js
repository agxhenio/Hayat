// 📄 js/services/prayerService.js

export const prayerService = {
    // Ky është lokacioni parazgjedhur (Fallback) nëse përdoruesi refuzon GPS
    location: {
        latitude: 41.3275,
        longitude: 19.8187,
        city: "Tiranë"
    },

    async getUserLocation() {
        return new Promise((resolve) => {
            // Kontrollo nëse e kemi ruajtur lokacionin më parë
            const savedLoc = localStorage.getItem('user_location');
            if (savedLoc) {
                this.location = JSON.parse(savedLoc);
                resolve(this.location);
                return;
            }

            // Kontrollo nëse pajisja e suporton GPS
            if (!navigator.geolocation) {
                resolve(this.location); // Kthe Tiranën
                return;
            }

            // Kërko leje dhe merr koordinatat
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    
                    try {
                        // Kthejmë Koordinatat në Emër Qyteti (Reverse Geocoding)
                        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=sq`);
                        const geoData = await geoRes.json();
                        
                        // Zgjedhim emrin e qytetit nga të dhënat
                        const city = geoData.city || geoData.locality || "Lokacioni juaj";
                        
                        this.location = { latitude: lat, longitude: lon, city: city };
                        
                        // E ruajmë që mos t'i kërkojmë GPS çdo herë që hapet app-i
                        localStorage.setItem('user_location', JSON.stringify(this.location));
                        resolve(this.location);
                    } catch (e) {
                        // Nëse dështon gjetja e emrit, ruajmë vetëm koordinatat
                        this.location = { latitude: lat, longitude: lon, city: "Gjetur me GPS" };
                        resolve(this.location);
                    }
                },
                (error) => {
                    console.warn("GPS i refuzuar. Përdorim lokacionin parazgjedhur.");
                    resolve(this.location);
                },
                { timeout: 10000, maximumAge: 60000 }
            );
        });
    },

    async getDailyTimings() {
        // Presim të marrim GPS-in (ose lokacionin e ruajtur) PARA se të kërkojmë oraret
        await this.getUserLocation();

        const today = new Date().toISOString().split('T')[0];
        // Ruajmë cache duke përfshirë edhe emrin e qytetit (nëse udhëton, të ndërrohen oraret)
        const cacheKey = `prayer_times_${this.location.city}_${today}`;
        
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }

        try {
            const url = `https://api.aladhan.com/v1/timings?latitude=${this.location.latitude}&longitude=${this.location.longitude}&method=3`;
            const response = await fetch(url);
            const json = await response.json();

            if (json.code === 200) {
                localStorage.setItem(cacheKey, JSON.stringify(json.data));
                return json.data;
            }
        } catch (error) {
            console.error("Gabim gjatë marrjes së kohëve të namazit:", error);
            return null;
        }
    },

    calculateCurrentAndNext(timings) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const prayers = [
            { id: 'Fajr', name: 'Sabahu', time: timings.Fajr },
            { id: 'Sunrise', name: 'Lindja', time: timings.Sunrise },
            { id: 'Dhuhr', name: 'Dreka', time: timings.Dhuhr },
            { id: 'Asr', name: 'Ikindia', time: timings.Asr },
            { id: 'Maghrib', name: 'Akshami', time: timings.Maghrib },
            { id: 'Isha', name: 'Jacia', time: timings.Isha }
        ];

        let currentPrayer = null;
        let nextPrayer = null;

        for (let i = 0; i < prayers.length; i++) {
            const [hours, minutes] = prayers[i].time.split(':').map(Number);
            const prayerMinutes = hours * 60 + minutes;

            if (currentMinutes < prayerMinutes) {
                nextPrayer = prayers[i];
                currentPrayer = i === 0 ? prayers[prayers.length - 1] : prayers[i - 1];
                break;
            }
        }

        if (!nextPrayer) {
            currentPrayer = prayers[prayers.length - 1];
            nextPrayer = prayers[0];
        }

        return { currentPrayer, nextPrayer };
    }
};
