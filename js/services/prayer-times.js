/**
 * Prayer Times Service (prayer-times.js)
 * Merr të dhënat e namazit nga API dhe i ruan offline
 */

import { Storage } from '../core/storage.js';

export const PrayerService = {
  // Përdorim Tiranën si default për komunitetin Shqiptar
  defaultCity: 'Tirana',
  defaultCountry: 'Albania',
  
  // Metoda 3 = Muslim World League (e përshtatshme për rajonin tonë)
  apiUrl: 'https://api.aladhan.com/v1/timingsByCity',

  /**
   * Merr kohët e namazit për ditën e sotme
   * Së pari kontrollon cache-in offline, pastaj bën request
   */
  async getTodayTimings() {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const cacheKey = `prayers_${today}`;
    
    // 1. Kontrollo nëse i kemi në Storage (Offline / Cache)
    const cachedData = Storage.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // 2. Nëse s'i kemi, bëj fetch nga API
    try {
      const response = await fetch(`${this.apiUrl}?city=${this.defaultCity}&country=${this.defaultCountry}&method=3`);
      if (!response.ok) throw new Error('API Error');
      
      const data = await response.json();
      const timings = data.data.timings;
      
      // Ruaj në Storage për përdorim offline
      Storage.set(cacheKey, timings);
      
      return timings;
    } catch (error) {
      console.error('[PrayerService] Gabim në marrjen e kohëve:', error);
      // Fallback në rast se nuk ka internet dhe nuk ka cache
      return null;
    }
  },

  /**
   * Llogarit cili është namazi i radhës bazuar në orën aktuale
   * @param {Object} timings 
   */
  getNextPrayer(timings) {
    if (!timings) return null;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Koha në minuta
    
    const prayers = [
      { name: 'Fajr', label: 'Sabahu', time: timings.Fajr },
      { name: 'Sunrise', label: 'Lindja e Diellit', time: timings.Sunrise },
      { name: 'Dhuhr', label: 'Dreka', time: timings.Dhuhr },
      { name: 'Asr', label: 'Ikindia', time: timings.Asr },
      { name: 'Maghrib', label: 'Akshami', time: timings.Maghrib },
      { name: 'Isha', label: 'Jacia', time: timings.Isha }
    ];

    for (let i = 0; i < prayers.length; i++) {
      const [hours, minutes] = prayers[i].time.split(':').map(Number);
      const prayerTimeInMinutes = hours * 60 + minutes;
      
      if (prayerTimeInMinutes > currentTime) {
        return {
          ...prayers[i],
          diffMinutes: prayerTimeInMinutes - currentTime
        };
      }
    }

    // Nëse kanë kaluar të gjitha, i radhës është Sabahu i ditës tjetër
    const [fajrHours, fajrMinutes] = timings.Fajr.split(':').map(Number);
    const nextFajrTime = (24 * 60) + (fajrHours * 60) + fajrMinutes;
    return {
      name: 'Fajr',
      label: 'Sabahu (Nesër)',
      time: timings.Fajr,
      diffMinutes: nextFajrTime - currentTime
    };
  }
};
