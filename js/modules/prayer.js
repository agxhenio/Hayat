// js/modules/prayer.js

class PrayerModule {
    constructor() {
        this.prayerNames = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        this.albanianNames = ['Sabahu', 'Lindja e Diellit', 'Dreka', 'Ikindia', 'Akshami', 'Jacia'];
        
        this.mockTimes = {
            Fajr: "05:25",
            Sunrise: "06:15",
            Dhuhr: "12:46",
            Asr: "16:45",
            Maghrib: "19:36",
            Isha: "21:12"
        };

        this.timerInterval = null;
        this.init();
    }

    init() {
        this.updateUI();
        this.timerInterval = setInterval(() => this.updateUI(), 1000);
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
        this.bindMobileEvents(); // Lidh klikimet në mënyrë të pavarur çdo sekondë
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

        const countdownEl = document.querySelector('.prayer-countdown');
        const labelEl = document.querySelector('.prayer-current-label');
        const timeEl = document.querySelector('.prayer-current-time');
        const circle = document.querySelector('.prayer-progress-circle');

        if (countdownEl) countdownEl.textContent = countdownText;
        if (labelEl) labelEl.textContent = `Deri në ${this.albanianNames[nextIdx]}`;
        if (timeEl) timeEl.textContent = `Koha aktuale: ${this.albanianNames[currentIdx] === 'Sunrise' ? 'Pas Lindjes' : this.albanianNames[currentIdx]}`;
        if (circle) circle.style.background = `conic-gradient(var(--color-accent-teal) 0% ${clampedPercentage}%, var(--color-surface-hover) ${clampedPercentage}% 100%)`;
    }

    updateCards(currentIdx) {
        const cards = document.querySelectorAll('.prayer-card');
        if (!cards.length) return;

        cards.forEach((card, index) => {
            if (!card.classList.contains('completed')) {
                card.classList.remove('active');
                if (index === currentIdx || (currentIdx === 1 && index === 0)) {
                    card.classList.add('active');
                }
            }
        });
    }

    // Lidhja e klikimeve me metodën .onclick direkte (Imune ndaj iOS/Safari/Spck bugs)
    bindMobileEvents() {
        const cards = document.querySelectorAll('.prayer-card');
        
        cards.forEach(card => {
            card.style.cursor = 'pointer';
            
            // Përdorim .onclick që mbishkruan çdo bug të eventListener-ave në mobile
            card.onclick = () => {
                // Gjejmë titullin e namazit me disa opsione fallback (në rast se s'është h3)
                const titleEl = card.querySelector('h3') || card.querySelector('h4') || card.querySelector('.prayer-name') || card.querySelector('p');
                const prayerName = titleEl ? titleEl.textContent.trim() : 'Namazi';
                
                this.openBottomSheet(prayerName);
            };
        });

        // Gjejmë fletën (Bottom Sheet) me disa emra të mundshëm ID-sh ose Klasash
        const sheet = document.getElementById('prayer-action-sheet') || document.querySelector('.bottom-sheet') || document.getElementById('action-sheet');
        if (!sheet) return; // Nëse s'ka fletë, ndalon këtu por KARTAT e mësipërme kanë marrë tashmë klikimin!

        // Lidhja e klikimit te Overlay (pjesa e errët mbrapa) për ta mbyllur
        const overlay = sheet.querySelector('.bottom-sheet-overlay') || sheet.querySelector('.overlay');
        if (overlay) {
            overlay.onclick = () => this.closeBottomSheet();
        }

        // Lidhja e butonave të opsioneve ("Në xhami", "Vetëm", etj.)
        const optionBtns = sheet.querySelectorAll('.prayer-option-btn') || sheet.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => {
            btn.onclick = () => {
                const actionTitleEl = sheet.querySelector('#action-sheet-title') || sheet.querySelector('.sheet-title');
                let prayerName = '';
                if (actionTitleEl) {
                    prayerName = actionTitleEl.textContent.replace('Regjistro: ', '').replace('Regjistro', '').trim();
                }
                
                this.closeBottomSheet();
                if (prayerName) {
                    this.markPrayerAsCompleted(prayerName);
                }
            };
        });
    }

    openBottomSheet(prayerName) {
        // Kërkojmë elementin e fletës me të gjitha mënyrat e mundshme të emërtimit
        const sheet = document.getElementById('prayer-action-sheet') || document.querySelector('.bottom-sheet') || document.getElementById('action-sheet');
        
        if (!sheet) {
            // Inteligjencë artificiale ndihmuese: Nëse klikohet karta por fleta nuk hapet, të tregon PSE në ekran!
            alert(`Kartela "${prayerName}" u klikua me sukses! Por në HTML nuk po gjendet elementi i Bottom Sheet. Kontrollo nëse ID-ja ose klasa e tij përputhet me kodin.`);
            return;
        }

        const titleEl = sheet.querySelector('#action-sheet-title') || sheet.querySelector('.sheet-title');
        if (titleEl) titleEl.textContent = `Regjistro: ${prayerName}`;

        // Shfaqja me forcë maksimale (Inline CSS) që të mposhtë çdo mangësi të CSS-së
        sheet.setAttribute('aria-hidden', 'false');
        sheet.classList.add('active');
        sheet.style.display = 'block';
        sheet.style.position = 'fixed';
        sheet.style.zIndex = '9999';

        const content = sheet.querySelector('.bottom-sheet-content') || sheet.querySelector('.sheet-content');
        if (content) {
            content.style.transform = 'translateY(0)';
            content.style.opacity = '1';
            content.style.display = 'block';
        }
    }

    closeBottomSheet() {
        const sheet = document.getElementById('prayer-action-sheet') || document.querySelector('.bottom-sheet') || document.getElementById('action-sheet');
        if (!sheet) return;

        sheet.setAttribute('aria-hidden', 'true');
        sheet.classList.remove('active');
        sheet.style.display = 'none';
    }

    markPrayerAsCompleted(prayerName) {
        const cards = document.querySelectorAll('.prayer-card');
        cards.forEach(card => {
            const titleEl = card.querySelector('h3') || card.querySelector('h4') || card.querySelector('.prayer-name') || card.querySelector('p');
            if(titleEl && titleEl.textContent.trim() === prayerName.trim()) {
                card.classList.remove('active');
                card.classList.add('completed');
                const statusEl = card.querySelector('.prayer-status');
                if (statusEl) statusEl.innerHTML = '<i data-lucide="check" style="width: 16px;"></i>';
                if (window.lucide) window.lucide.createIcons();
            }
        });
    }
}

// ========================================================
// MENAXHIMI I ROUTER-IT (SPA)
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
    const appView = document.getElementById('app-view');
    
    function checkAndInitialize() {
        if (document.querySelector('.prayer-hero')) {
            if (!window.currentPrayerApp) {
                window.currentPrayerApp = new PrayerModule();
            }
        } else {
            if (window.currentPrayerApp) {
                if (window.currentPrayerApp.timerInterval) {
                    clearInterval(window.currentPrayerApp.timerInterval);
                }
                window.currentPrayerApp = null;
            }
        }
    }

    if (appView) {
        const observer = new MutationObserver(() => {
            checkAndInitialize();
        });
        observer.observe(appView, { childList: true, subtree: true });
    }
    
    checkAndInitialize();
});
