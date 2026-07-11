// js/modules/prayer.js

class PrayerModule {
    constructor() {
        this.prayerNames = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        this.albanianNames = ['Sabahu', 'Lindja e Diellit', 'Dreka', 'Ikindia', 'Akshami', 'Jacia'];
        
        // Këto do t'i marrim nga prayerService.js në të ardhmen, 
        // por për momentin po përdorim të dhëna testimi për të parë vizualizimin.
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
        if (!document.querySelector('.prayer-hero')) return; // Sigurohemi që jemi te faqja e Namazit
        
        this.updateUI();
        // Rifresko çdo sekondë
        setInterval(() => this.updateUI(), 1000);
    }

    updateUI() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes(); // Koha aktuale në minuta
        
        let currentPrayerIndex = -1;
        let nextPrayerIndex = 0;

        // Gjej cili është namazi aktual dhe i radhës
        for (let i = 0; i < this.prayerNames.length; i++) {
            const timeStr = this.mockTimes[this.prayerNames[i]];
            const [hours, minutes] = timeStr.split(':').map(Number);
            const prayerTimeInMinutes = hours * 60 + minutes;

            if (currentTime >= prayerTimeInMinutes) {
                currentPrayerIndex = i;
                nextPrayerIndex = (i + 1) % this.prayerNames.length;
            }
        }

        // Nëse jemi para Sabahut
        if (currentPrayerIndex === -1) {
            currentPrayerIndex = this.prayerNames.length - 1; // Jacia e ditës së kaluar
            nextPrayerIndex = 0; // Sabahu
        }

        this.updateHero(currentPrayerIndex, nextPrayerIndex, now);
        this.updateCards(currentPrayerIndex);
    }

    updateHero(currentIdx, nextIdx, now) {
        // Llogaritja e mbetjes së kohës (Countdown)
        const nextTimeStr = this.mockTimes[this.prayerNames[nextIdx]];
        const [nextHours, nextMinutes] = nextTimeStr.split(':').map(Number);
        
        let nextPrayerDate = new Date(now);
        nextPrayerDate.setHours(nextHours, nextMinutes, 0, 0);

        if (nextIdx === 0 && now.getHours() > 12) {
            // Nëse namazi i radhës është Sabahu, shto 1 ditë
            nextPrayerDate.setDate(nextPrayerDate.getDate() + 1);
        }

        const diffSeconds = Math.floor((nextPrayerDate - now) / 1000);
        
        const hours = Math.floor(diffSeconds / 3600);
        const minutes = Math.floor((diffSeconds % 3600) / 60);
        const seconds = diffSeconds % 60;

        const countdownText = `- ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Llogaritja e përqindjes së rrethit (simulim vizual)
        // Këtu mund të bëhet një llogaritje më komplekse e bazuar në totalin e ditës
        const percentage = 100 - (diffSeconds / (24 * 3600) * 100 * 5); // Thjesht për efekt vizual
        const clampedPercentage = Math.max(0, Math.min(100, percentage));

        // Përditëso DOM
        document.querySelector('.prayer-countdown').textContent = countdownText;
        document.querySelector('.prayer-current-label').textContent = `Deri në ${this.albanianNames[nextIdx]}`;
        document.querySelector('.prayer-current-time').textContent = `Koha aktuale: ${this.albanianNames[currentIdx] === 'Sunrise' ? 'Pas Lindjes' : this.albanianNames[currentIdx]}`;
        
        const circle = document.querySelector('.prayer-progress-circle');
        circle.style.background = `conic-gradient(var(--color-accent-teal) 0% ${clampedPercentage}%, var(--color-surface-hover) ${clampedPercentage}% 100%)`;
    }

    updateCards(currentIdx) {
        const cards = document.querySelectorAll('.prayer-card');
        if (!cards.length) return;

        // Reset all classes
        cards.forEach(card => {
            card.classList.remove('active', 'completed');
            card.querySelector('.prayer-status').innerHTML = '';
        });

        // Përditëso listën (Duke përjashtuar Lindjen e Diellit nëse nuk e ke në HTML, supozojmë 5 vaktet + Lindja)
        // Për momentin HTML-ja ka 5 vajte. Logjika do përshtatet sipas indeksit.
        // Ky është thjesht një skeleton për të aktivizuar kartën vizualisht.
        const uiCards = Array.from(cards);
        
        uiCards.forEach((card, index) => {
            // Logjikë e thjeshtuar për efektin vizual
            if (index < currentIdx && this.albanianNames[currentIdx] !== 'Sunrise') {
                card.classList.add('completed');
                card.querySelector('.prayer-status').innerHTML = '<i data-lucide="check" style="width: 16px;"></i>';
            } else if (index === currentIdx || (currentIdx === 1 && index === 0)) {
                card.classList.add('active');
            }
        });
        
        // Rifresko ikonat Lucide nëse përdoren
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
}

// Inicimi i modulit
document.addEventListener('DOMContentLoaded', () => {
    new PrayerModule();
});
