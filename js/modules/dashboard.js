/**
 * Dashboard Module (dashboard.js)
 */

import { Utils } from '../core/utils.js';
import { PrayerService } from '../services/prayer-times.js';

class DashboardModule {
  constructor() {
    document.addEventListener('pageLoaded', (e) => {
      if (e.detail.path === '/dashboard') {
        this.mount();
      }
    });
  }

  mount() {
    this.updateHeaderInfo();
    this.updateHeroCard();
    if (window.lucide) window.lucide.createIcons();
  }

  updateHeaderInfo() {
    const greetingEl = document.getElementById('dash-greeting');
    const dateEl = document.getElementById('dash-date');
    const hijriEl = document.getElementById('dash-hijri');

    if (greetingEl) greetingEl.textContent = `${Utils.getGreeting()}, Vëlla`;
    if (dateEl) dateEl.textContent = Utils.getFormattedDate();
    if (hijriEl) hijriEl.textContent = Utils.getHijriDate();
  }

  async updateHeroCard() {
    const timings = await PrayerService.getTodayTimings();
    if (!timings) return;

    const nextPrayer = PrayerService.getNextPrayer(timings);
    if (!nextPrayer) return;

    // Përditëso UI-në e Dashboard-it me të dhënat reale
    const heroCard = document.querySelector('.card--gradient');
    if (heroCard) {
      const hours = Math.floor(nextPrayer.diffMinutes / 60);
      const minutes = nextPrayer.diffMinutes % 60;

      heroCard.innerHTML = `
        <div class="badge badge--gold" style="margin-bottom: var(--space-4);">Koha e ardhshme</div>
        <h2 style="font-size: var(--font-size-4xl); margin-bottom: var(--space-2); color: #fff;">${nextPrayer.label}</h2>
        <p style="font-size: var(--font-size-lg); color: rgba(255,255,255,0.8); margin-bottom: var(--space-6);">${nextPrayer.time}</p>
        
        <div style="display: flex; justify-content: center; align-items: center; gap: var(--space-4);">
          <div style="text-align: center;">
            <span style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); font-variant-numeric: tabular-nums;">${hours.toString().padStart(2, '0')}</span>
            <div style="font-size: var(--font-size-xs); color: rgba(255,255,255,0.6); text-transform: uppercase;">Orë</div>
          </div>
          <span style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); margin-top: -15px;">:</span>
          <div style="text-align: center;">
            <span style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); font-variant-numeric: tabular-nums;">${minutes.toString().padStart(2, '0')}</span>
            <div style="font-size: var(--font-size-xs); color: rgba(255,255,255,0.6); text-transform: uppercase;">Min</div>
          </div>
        </div>
      `;
    }
  }
}

export const dashboardModule = new DashboardModule();
