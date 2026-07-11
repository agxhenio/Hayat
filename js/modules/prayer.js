// js/modules/prayer.js

class PrayerModule {
    constructor() {
        this.prayerNames = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        this.albanianNames = ['Sabahu', 'Lindja e Diellit', 'Dreka', 'Ikindia', 'Akshami', 'Jacia'];
        
        // Kohët e testit (më vonë i lidhim me API-në)
        this.mockTimes = {
            Fajr: "05:25",
            Sunrise: "06:15",
            Dhuhr: "12:46",
            Asr: "16:45",
            Maghrib: "19:36",
            Isha: "21:12"
        };

        this.init();
    }

    init() {
        if (!document.querySelector('.prayer-hero')) return;
        
        this.updateUI();
        setInterval(() => this.updateUI(), 1000); // Llogaritja çdo sekondë
        this.attachListeners(); // Aktivizon butonat dhe Bottom Sheet
    }

    updateUI() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        let currentPrayerIndex = -1;
        let nextPrayerIndex = 0;

        for (let i = 0; i < this.prayerNames.length; i++) {
            const timeStr = this.mockTimes[this.prayerNames[i]];
            const [hours, minutes] = timeStr.split(':').map(Number);
            const prayerTimeInMinutes = hours * 60 + minutes;

            if (currentTime >= prayerTimeInMinutes) {
                currentPrayerIndex = i;
                nextPrayerIndex = (i + 1) % this.prayerNames.length;
            }
        }

        if (currentPrayerIndex === -1) {
            currentPrayerIndex = this.prayerNames.length - 1;
            nextPrayerIndex = 0;
        }

        this.updateHero(currentPrayerIndex, nextPrayerIndex, now);
        this.updateCards(currentPrayerIndex);
    }

    updateHero(currentIdx, nextIdx, now) {
        const nextTimeStr = this.mockTimes[this.prayerNames[nextIdx]];
        const [nextHours, nextMinutes] = nextTimeStr.split(':').map(Number);
        
        let nextPrayerDate = new Date(now);
        nextPrayerDate.setHours(nextHours, nextMinutes, 0, 0);

        if (nextIdx === 0 && now.getHours() > 12) {
            nextPrayerDate.setDate(nextPrayerDate.getDate() + 1);
        }

        const diffSeconds = Math.floor((nextPrayerDate - now) / 1000);
        const hours = Math.floor(diffSeconds / 3600);
        const minutes = Math.floor((diffSeconds % 3600) / 60);
        const seconds = diffSeconds % 60;

        const countdownText = `- ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        const percentage = 100 - (diffSeconds / (24 * 3600) * 100 * 5);
        const clampedPercentage = Math.max(0, Math.min(100, percentage));

        document.querySelector('.prayer-countdown').textContent = countdownText;
        document.querySelector('.prayer-current-label').textContent = `Deri në ${this.albanianNames[nextIdx]}`;
        document.querySelector('.prayer-current-time').textContent = `Koha aktuale: ${this.albanianNames[currentIdx] === 'Sunrise' ? 'Pas Lindjes' : this.albanianNames[currentIdx]}`;
        
        const circle = document.querySelector('.prayer-progress-circle');
        circle.style.background = `conic-gradient(var(--color-accent-teal) 0% ${clampedPercentage}%, var(--color-surface-hover) ${clampedPercentage}% 100%)`;
    }

    updateCards(currentIdx) {
        const cards = document.querySelectorAll('.prayer-card');
        if (!cards.length) return;

        const uiCards = Array.from(cards);
        
        uiCards.forEach((card, index) => {
            // Hiqim të gjitha klasat përpara se të shtojmë të rejat (përveç atyre të mbaruara manualisht)
            if (!card.classList.contains('completed')) {
                card.classList.remove('active');
                
                // Namazi i kaluar (automatikisht aktivizon vetëm UI)
                if (index < currentIdx && this.albanianNames[currentIdx] !== 'Sunrise') {
                    // Mund ta bëjmë gri, por për momentin lëre bosh nëse s'është shënuar manualisht
                } else if (index === currentIdx || (currentIdx === 1 && index === 0)) {
                    card.classList.add('active'); // Thekson namazin aktual
                }
            }
        });
    }

    attachListeners() {
        const cards = document.querySelectorAll('.prayer-card');
        const sheet = document.getElementById('prayer-action-sheet');
        const overlay = sheet.querySelector('.bottom-sheet-overlay');
        const optionBtns = document.querySelectorAll('.prayer-option-btn');
        const titleEl = document.getElementById('action-sheet-title');

        // Hap Bottom Sheet
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const prayerName = card.querySelector('h3').textContent;
                titleEl.textContent = `Regjistro: ${prayerName}`;
                sheet.setAttribute('aria-hidden', 'false');
            });
        });

        // Mbyll Bottom Sheet
        overlay.addEventListener('click', () => {
            sheet.setAttribute('aria-hidden', 'true');
        });

        // Kur zgjedh opsionin (Xhami, Shtëpi, etj.)
        optionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const method = e.currentTarget.dataset.method;
                const prayerName = titleEl.textContent.replace('Regjistro: ', '');
                
                // Mbyll fletën
                sheet.setAttribute('aria-hidden', 'true');
                
                // Bëj kartën e gjelbër!
                this.markPrayerAsCompleted(prayerName);
            });
        });
    }

    markPrayerAsCompleted(prayerName) {
        const cards = document.querySelectorAll('.prayer-card');
        cards.forEach(card => {
            if(card.querySelector('h3').textContent === prayerName) {
                card.classList.remove('active');
                card.classList.add('completed');
                card.querySelector('.prayer-status').innerHTML = '<i data-lucide="check" style="width: 16px;"></i>';
                if (window.lucide) window.lucide.createIcons(); // Siguron që ikona 'check' të shfaqet
            }
        });
    }
}

// Nisja e Modulit
document.addEventListener('DOMContentLoaded', () => {
    new PrayerModule();
});
