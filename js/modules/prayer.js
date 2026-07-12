class PrayerModule {
    constructor() {
        this.prayerNames = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        this.albanianNames = ['Sabahu', 'Lindja e Diellit', 'Dreka', 'Ikindia', 'Akshami', 'Jacia'];
        this.mockTimes = { Fajr: "05:25", Sunrise: "06:15", Dhuhr: "12:46", Asr: "16:45", Maghrib: "19:36", Isha: "21:12" };
        this.timerInterval = null;
        
        console.log("🟢 Moduli i Namazit u ngarkua me sukses!");
        this.init();
    }
    
    init() {
        this.updateUI();
        this.timerInterval = setInterval(() => this.updateUI(), 1000);
    }
    
    updateUI() {
        if (!document.querySelector('.prayer-hero')) return; // Nëse s'jemi te faqja, mos harxho bateri
        
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        let currentPrayerIndex = -1;
        let nextPrayerIndex = 0;
        
        for (let i = 0; i < this.prayerNames.length; i++) {
            const [hours, minutes] = this.mockTimes[this.prayerNames[i]].split(':').map(Number);
            if (currentTime >= hours * 60 + minutes) {
                currentPrayerIndex = i;
                nextPrayerIndex = (i + 1) % this.prayerNames.length;
            }
        }
        if (currentPrayerIndex === -1) { currentPrayerIndex = 5;
            nextPrayerIndex = 0; }
        
        this.updateHero(currentPrayerIndex, nextPrayerIndex, now);
        this.updateCards(currentPrayerIndex);
    }
    
    updateHero(currentIdx, nextIdx, now) {
        const [nextHours, nextMinutes] = this.mockTimes[this.prayerNames[nextIdx]].split(':').map(Number);
        let nextDate = new Date(now);
        nextDate.setHours(nextHours, nextMinutes, 0, 0);
        if (nextIdx === 0 && now.getHours() > 12) nextDate.setDate(nextDate.getDate() + 1);
        
        const diffSecs = Math.floor((nextDate - now) / 1000);
        const countdownText = `- ${String(Math.floor(diffSecs / 3600)).padStart(2, '0')}:${String(Math.floor((diffSecs % 3600) / 60)).padStart(2, '0')}:${String(diffSecs % 60).padStart(2, '0')}`;
        const percentage = Math.max(0, Math.min(100, 100 - (diffSecs / (24 * 3600) * 100 * 5)));
        
        const countdownEl = document.querySelector('.prayer-countdown');
        if (countdownEl) countdownEl.textContent = countdownText;
        
        const labelEl = document.querySelector('.prayer-current-label');
        if (labelEl) labelEl.textContent = `Deri në ${this.albanianNames[nextIdx]}`;
        
        const circle = document.querySelector('.prayer-progress-circle');
        if (circle) circle.style.background = `conic-gradient(var(--color-accent-teal) 0% ${percentage}%, var(--color-surface-hover) ${percentage}% 100%)`;
    }
    
    updateCards(currentIdx) {
        document.querySelectorAll('.prayer-card').forEach((card, index) => {
            if (!card.classList.contains('completed')) {
                card.classList.remove('active');
                if (index === currentIdx || (currentIdx === 1 && index === 0)) {
                    card.classList.add('active');
                }
            }
        });
    }
    
    markCompleted(prayerName) {
        document.querySelectorAll('.prayer-card').forEach(card => {
            if (card.dataset.prayer === prayerName) {
                card.classList.remove('active');
                card.classList.add('completed');
                const status = card.querySelector('.prayer-status');
                if (status) status.innerHTML = '<i data-lucide="check" style="width: 16px;"></i>';
                if (window.lucide) window.lucide.createIcons();
            }
        });
    }
}

// Global Event Listener për klikimet (Imun ndaj Router-it)
document.body.addEventListener('click', (e) => {
    // 1. Klikimi mbi Kartë
    const card = e.target.closest('.prayer-card');
    if (card) {
        const prayerName = card.dataset.prayer;
        const sheet = document.getElementById('prayer-action-sheet');
        if (sheet) {
            document.getElementById('action-sheet-title').textContent = `Regjistro: ${prayerName}`;
            sheet.setAttribute('aria-hidden', 'false');
            sheet.classList.add('active');
        }
        return;
    }
    
    // 2. Klikimi mbi Overlay (Për ta mbyllur)
    if (e.target.closest('.bottom-sheet-overlay') || e.target.closest('[data-close-sheet]')) {
        const sheet = document.getElementById('prayer-action-sheet');
        if (sheet) {
            sheet.setAttribute('aria-hidden', 'true');
            sheet.classList.remove('active');
        }
        return;
    }
    
    // 3. Klikimi mbi "Në xhami", "Shtëpi" etj.
    const optionBtn = e.target.closest('.prayer-option-btn');
    if (optionBtn) {
        const sheet = document.getElementById('prayer-action-sheet');
        if (sheet) {
            const prayerName = document.getElementById('action-sheet-title').textContent.replace('Regjistro: ', '');
            sheet.setAttribute('aria-hidden', 'true');
            sheet.classList.remove('active');
            
            if (window.currentPrayerApp) {
                window.currentPrayerApp.markCompleted(prayerName);
            }
        }
        return;
    }
});

// Inicializimi me Router
document.addEventListener('DOMContentLoaded', () => {
    const appView = document.getElementById('app-view');
    const checkInit = () => {
        if (document.querySelector('.prayer-hero')) {
            if (!window.currentPrayerApp) window.currentPrayerApp = new PrayerModule();
        } else if (window.currentPrayerApp) {
            clearInterval(window.currentPrayerApp.timerInterval);
            window.currentPrayerApp = null;
        }
    };
    if (appView) new MutationObserver(checkInit).observe(appView, { childList: true, subtree: true });
    checkInit();
});