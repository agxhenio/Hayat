/**
 * Prayer Module (prayer.js)
 * Kontrollon logjikën e faqes së namazit
 */

import { PrayerService } from '../services/prayer-times.js';

class PrayerModule {
  constructor() {
    document.addEventListener('pageLoaded', (e) => {
      if (e.detail.path === '/prayer') {
        this.mount();
      }
    });
  }

  async mount() {
    console.log('[Prayer] Moduli u ngarkua.');
    await this.renderPrayerList();
    
    if (window.lucide) window.lucide.createIcons();
  }

  async renderPrayerList() {
    const container = document.getElementById('prayer-list-container');
    if (!container) return;

    const timings = await PrayerService.getTodayTimings();
    
    if (!timings) {
      container.innerHTML = `
        <div style="padding: var(--space-6); text-align: center; color: var(--color-text-secondary);">
          <i data-lucide="wifi-off" style="margin-bottom: var(--space-2);"></i>
          <p>Nuk mund të ngarkohen të dhënat. Kontrolloni internetin.</p>
        </div>`;
      return;
    }

    const nextPrayer = PrayerService.getNextPrayer(timings);

    const prayers = [
      { id: 'Fajr', label: 'Sabahu', icon: 'moon' },
      { id: 'Sunrise', label: 'Lindja', icon: 'sunrise' },
      { id: 'Dhuhr', label: 'Dreka', icon: 'sun' },
      { id: 'Asr', label: 'Ikindia', icon: 'sun-dim' },
      { id: 'Maghrib', label: 'Akshami', icon: 'sunset' },
      { id: 'Isha', label: 'Jacia', icon: 'moon-star' }
    ];

    let html = '';

    prayers.forEach(p => {
      const isNext = nextPrayer && nextPrayer.name === p.id;
      
      // Theksojmë namazin e radhës
      const bgStyle = isNext ? 'background-color: hsla(var(--h-accent-gold), var(--s-accent-gold), var(--l-accent-gold), 0.1); border-left: 4px solid var(--color-accent-gold);' : '';
      const textStyle = isNext ? 'color: var(--color-accent-gold); font-weight: bold;' : '';

      html += `
        <div class="list-item" style="padding: var(--space-4); ${bgStyle}">
          <i data-lucide="${p.icon}" style="margin-inline-end: var(--space-3); color: ${isNext ? 'var(--color-accent-gold)' : 'var(--color-text-tertiary)'};"></i>
          <div class="list-item__content">
            <div class="list-item__title" style="${textStyle}">${p.label}</div>
          </div>
          <div style="font-weight: var(--font-weight-bold); font-size: var(--font-size-lg); font-variant-numeric: tabular-nums; ${textStyle}">
            ${timings[p.id]}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }
}

export const prayerModule = new PrayerModule();
