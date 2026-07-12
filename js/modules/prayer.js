class PrayerModule {
    constructor() {
        this.prayerNames = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        this.albanianNames = ['Sabahu', 'Lindja e Diellit', 'Dreka', 'Ikindia', 'Akshami', 'Jacia'];
        this.mockTimes = { Fajr: "05:25", Sunrise: "06:15", Dhuhr: "12:46", Asr: "16:45", Maghrib: "19:36", Isha: "21:12" };
        this.timerInterval = null;
        
        console.log("🟢 Moduli i Namazit u nis.");
        this.init();
    }
    
    init() {
        this.updateUI();
        this.timerInterval = setInterval(() => this.updateUI(), 1000);
    }
    
    updateUI() {
        if (!document.querySelector('.prayer-hero')) return;
        
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
}

// ==========================================
// FUNKSIONET GLOBALE (TË PAGABUESHME)
// ==========================================
window.currentSelectedPrayer = ""; // Mban mend cilin namaz klikuam

// Hap fletën
window.openPrayerSheet = function(prayerName) {
    window.currentSelectedPrayer = prayerName;
    const sheet = document.getElementById('prayer-action-sheet');
    const content = document.getElementById('sheet-content');
    const title = document.getElementById('action-sheet-title');
    
    if (sheet && content && title) {
        title.textContent = `Regjistro: ${prayerName}`;
        sheet.style.display = 'block';
        
        // Përdorim setTimeout për të bërë animacionin smooth të hyrjes
        setTimeout(() => {
            content.style.transform = 'translateY(0)';
        }, 10);
    }
};

// Mbyll fletën
window.closePrayerSheet = function() {
    const sheet = document.getElementById('prayer-action-sheet');
    const content = document.getElementById('sheet-content');
    
    if (sheet && content) {
        content.style.transform = 'translateY(100%)'; // Zbret poshtë
        // Presim të mbarojë animacioni para se ta fshehim komplet
        setTimeout(() => {
            sheet.style.display = 'none';
        }, 300);
    }
};

// Regjistro namazin dhe vendos tik-un e gjelbër (✔)
window.registerPrayer = function(method) {
    const prayerName = window.currentSelectedPrayer;
    
    // Gjejmë rrethin e statusit për namazin specifik
    const statusDiv = document.getElementById(`status-${prayerName}`);
    if (statusDiv) {
        // I vendosim një ngjyrë të gjelbër rrethit
        statusDiv.style.background = '#2ECC71';
        statusDiv.style.borderColor = '#2ECC71';
        
        // Nëse kemi ikonat lucide, i shtojmë ikonën check
        if (window.lucide) {
            statusDiv.innerHTML = '<i data-lucide="check" style="color: white; width: 16px;"></i>';
            window.lucide.createIcons();
        } else {
            statusDiv.innerHTML = '<span style="color: white; font-size: 14px;">✔</span>';
        }
        
        // Gjejmë kartën prind dhe i heqim klasën "active"
        const card = statusDiv.closest('.prayer-card');
        if (card) {
            card.classList.remove('active');
            card.classList.add('completed');
        }
    }
    
    window.closePrayerSheet();
};

// ==========================================
// INICIALIZIMI
// ==========================================
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