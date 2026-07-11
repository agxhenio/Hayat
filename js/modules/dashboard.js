// 📄 js/modules/dashboard.js
import { ui } from '../core/ui.js';
import { prayerService } from '../services/prayerService.js';

export const dashboardModule = {
    async init() {
        console.log('Dashboard module initialized');
        this.initInfiniteCarousel();
        this.bindEvents();
        
        await this.loadPrayerData();
    },

    async loadPrayerData() {
        const data = await prayerService.getDailyTimings();
        if (!data) return;

        const locationEl = document.getElementById('location-name');
        if (locationEl) locationEl.innerText = prayerService.location.city;

        this.updateDates(data.date);

        const { currentPrayer, nextPrayer } = prayerService.calculateCurrentAndNext(data.timings);
        this.updatePrayerUI(currentPrayer, nextPrayer);

        // Thërrasim funksionin e ri për Kujtesat Dinamike
        this.renderDynamicReminders(data.timings);
    },

    renderDynamicReminders(timings) {
        const container = document.getElementById('dynamic-reminders');
        if (!container) return;

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const currentDay = now.getDay(); // 0 = E Diel, 5 = E Premte

        // Funksion ndihmës për të kthyer orën (psh "12:30") në minuta
        const timeToMins = (timeStr) => {
            const [h, m] = timeStr.split(':').map(Number);
            return h * 60 + m;
        };

        const sunriseMins = timeToMins(timings.Sunrise);
        const dhuhrMins = timeToMins(timings.Dhuhr);
        const maghribMins = timeToMins(timings.Maghrib);

        let remindersHTML = '';

        // 1. Dhikri i Mëngjesit: 30 min para lindjes deri 30 min para drekës
        if (currentMinutes >= (sunriseMins - 30) && currentMinutes <= (dhuhrMins - 30)) {
            remindersHTML += this.buildReminderCard(
                'Dhikri i mëngjesit',
                'Ngjalle zemrën me përmendje të Allahut!',
                'sun', // Ikona
                '#EAB308', // Ngjyra e arit/verdhë
                '#/dhikr/mengjesi'
            );
        }

        // 2. Dhikri i Mbrëmjes: 30 min para akshamit deri 30 min para mesnatës (23:30)
        if (currentMinutes >= (maghribMins - 30) && currentMinutes <= (24 * 60 - 30)) {
            remindersHTML += this.buildReminderCard(
                'Dhikri i mbrëmjes',
                'Mbylleni ditën me mbrojtjen e Allahut.',
                'moon',
                '#14B8A6', // Ngjyra Teal
                '#/dhikr/mbremja'
            );
        }

        // 3. Surja Kehf: Çdo të Premte
        // (Opsionale më vonë: mund ta bëjmë të nisë nga e enjtja në aksham)
        if (currentDay === 5) {
            remindersHTML += this.buildReminderCard(
                'Leximi i Sures Kehf',
                'Dritë mes dy xhumave.',
                'book-open',
                '#10B981', // E gjelbër (Emerald)
                '#/kurani/kehf'
            );
        }

        // Fusim kartat në ekran
        container.innerHTML = remindersHTML;

        // I themi Lucide të vizatojë ikonat e reja që sapo futëm
        if (window.lucide) {
            window.lucide.createIcons();
        }
    },

    // Skema vizuale e kartës si në "Foto 2"
    buildReminderCard(title, subtitle, icon, color, link) {
        return `
            <a href="${link}" class="card" style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3); text-decoration: none; background-color: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
                <div style="background-color: ${color}20; width: 44px; height: 44px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i data-lucide="${icon}" style="width: 22px; height: 22px; color: ${color};"></i>
                </div>
                <div style="flex-grow: 1;">
                    <h4 class="text-base font-bold text-primary" style="margin: 0;">${title}</h4>
                    <p class="text-xs text-tertiary" style="margin: 2px 0 0 0;">${subtitle}</p>
                </div>
                <i data-lucide="chevron-right" style="width: 18px; height: 18px; color: var(--color-text-tertiary);"></i>
            </a>
        `;
    },

    updateDates(dateData) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let gregorianStr = new Date().toLocaleDateString('sq-AL', options);
        gregorianStr = gregorianStr.charAt(0).toUpperCase() + gregorianStr.slice(1);
        
        const elGregorian = document.getElementById('gregorian-date');
        if (elGregorian) elGregorian.innerText = gregorianStr;

        const hijri = dateData.hijri;
        const elHijri = document.getElementById('hijri-date');
        if (elHijri) {
            elHijri.innerText = `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
        }
    },

    updatePrayerUI(current, next) {
        const elCurrentName = document.getElementById('current-prayer-name');
        const elCurrentTime = document.getElementById('current-prayer-time');
        if (elCurrentName) elCurrentName.innerText = current.name;
        if (elCurrentTime) elCurrentTime.innerText = current.time;

        const elNextName = document.getElementById('next-prayer-name');
        const elNextTime = document.getElementById('next-prayer-time');
        if (elNextName) elNextName.innerText = next.name;
        if (elNextTime) elNextTime.innerText = next.time;
    },

    bindEvents() {
        const playableCards = document.querySelectorAll('.js-play-video');
        playableCards.forEach(card => {
            card.removeEventListener('click', this.handlePlayClick); 
            card.addEventListener('click', this.handlePlayClick);
        });
    },

    handlePlayClick(e) {
        const card = e.currentTarget;
        const title = card.querySelector('h4').innerText;
        const desc = card.querySelector('p').innerText;

        const sheetHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
                <div>
                    <h3 class="font-bold text-lg">${title}</h3>
                    <p class="text-sm text-tertiary">${desc}</p>
                </div>
                <button class="btn btn--icon btn--secondary" onclick="document.getElementById('global-overlay').click()">
                    <i data-lucide="x" style="width: 20px; color: var(--color-text-secondary);"></i>
                </button>
            </div>
            <div style="width: 100%; aspect-ratio: 16/9; background: #000; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; margin-bottom: var(--space-4);">
                <div style="background: var(--color-accent-teal); width: 60px; height: 60px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; z-index: 1;">
                    <i data-lucide="play" style="width: 24px; color: var(--color-bg-primary); fill: currentColor;"></i>
                </div>
            </div>
        `;
        ui.openBottomSheet(sheetHTML);
    },

    initInfiniteCarousel() {
        const track = document.querySelector('.carousel-track');
        if (!track) return;

        const items = Array.from(track.querySelectorAll('.carousel-item'));
        items.forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true'); 
            if (clone.classList.contains('js-play-video')) {
                clone.addEventListener('click', this.handlePlayClick);
            }
            track.appendChild(clone);
        });

        track.addEventListener('scroll', () => {
            const maxScroll = track.scrollWidth / 2;
            if (track.scrollLeft >= maxScroll) {
                track.style.scrollBehavior = 'auto';
                track.scrollLeft = track.scrollLeft - maxScroll;
                requestAnimationFrame(() => track.style.scrollBehavior = 'smooth');
            } else if (track.scrollLeft <= 0) {
                track.style.scrollBehavior = 'auto';
                track.scrollLeft = maxScroll;
                requestAnimationFrame(() => track.style.scrollBehavior = 'smooth');
            }
        });
    }
};
