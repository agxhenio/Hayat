/**
 * Moduli Kryesor i Namazit
 * Menaxhon ndërfaqen, llogaritjet, qiblën, dhikrin dhe logimin.
 */

class PrayerModule {
    constructor() {
        // Elementet e Ekraneve (Faqeve)
        this.pages = {
            main: document.getElementById('prayer-page'),
            log: document.getElementById('prayer-log-page'),
            dhikr: document.getElementById('prayer-dhikr-page'),
            qibla: document.getElementById('qibla-page'),
            stats: document.getElementById('prayer-stats-page')
        };

        // Të dhënat
        this.sunnahData = null;
        this.dhikrData = null;
        this.prayerLogs = JSON.parse(localStorage.getItem('prayer_logs')) || {};
        
        // Gjendja aktuale
        this.currentPrayerSelection = null;
        this.currentDhikrIndex = 0;
        this.dhikrCount = 0;
        
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadJSONData();
        this.updateClock();
        setInterval(() => this.updateClock(), 60000); // Përditëso çdo minutë
    }

    async loadJSONData() {
        try {
            const [sunnahRes, dhikrRes] = await Promise.all([
                fetch('js/data/sunnah-prayers.json'),
                fetch('js/data/dhikr-after-prayer.json')
            ]);
            this.sunnahData = await sunnahRes.json();
            this.dhikrData = await dhikrRes.json();
        } catch (e) {
            console.error("Gabim në ngarkimin e JSON: ", e);
        }
    }

    // --- MENAXHIMI I NDËRFAQES (NAVIGATION) ---
    showPage(pageName) {
        // Fshih të gjitha
        Object.values(this.pages).forEach(page => {
            if (page) page.style.display = 'none';
        });
        // Shfaq atë që duam
        if (this.pages[pageName]) {
            this.pages[pageName].style.display = 'flex';
            if(pageName === 'main') this.pages.main.style.display = 'block'; // main nuk është flex column
        }
    }

    bindEvents() {
        // Nga Kryefaqja
        document.getElementById('nav-qibla')?.addEventListener('click', () => {
            this.showPage('qibla');
            this.initQibla();
        });
        document.getElementById('nav-stats')?.addEventListener('click', () => {
            this.updateStats();
            this.showPage('stats');
        });
        document.getElementById('btn-mark-prayed')?.addEventListener('click', () => {
            this.openPrayerLog('dreka'); // Për shembull, duhet kapur dinamikisht koha aktuale
        });

        // Eventet e kartave të namazit (Sabahu, Dreka, etj)
        const prayerCards = ['sabahu', 'dreka', 'ikindia', 'akshami', 'jacia'];
        prayerCards.forEach(prayer => {
            document.getElementById(`card-${prayer}`)?.addEventListener('click', () => {
                this.openPrayerLog(prayer);
            });
        });

        // Kthimet mbrapa
        document.getElementById('btn-back-prayer')?.addEventListener('click', () => this.showPage('main'));
        document.getElementById('btn-back-qibla')?.addEventListener('click', () => this.showPage('main'));
        document.getElementById('btn-back-stats')?.addEventListener('click', () => this.showPage('main'));
        document.getElementById('btn-close-dhikr')?.addEventListener('click', () => this.showPage('main'));

        // Faqja e Logimit (Si u fale)
        const methodBtns = document.querySelectorAll('.method-btn');
        methodBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                methodBtns.forEach(b => b.querySelector('.radio-circle').style.background = 'transparent');
                e.currentTarget.querySelector('.radio-circle').style.background = '#3B82F6';
                this.currentPrayerSelection.method = e.currentTarget.dataset.method;
            });
        });

        document.getElementById('btn-continue-dhikr')?.addEventListener('click', () => {
            this.savePrayerLog();
            this.startDhikr();
        });
        
        document.getElementById('btn-save-no-dhikr')?.addEventListener('click', () => {
            this.savePrayerLog();
            this.showPage('main');
            this.updateClock(); // Rrifresko UI
        });

        // Faqja e Dhikrit
        document.getElementById('btn-tap-dhikr')?.addEventListener('click', () => this.handleDhikrTap());

        // Busulla
        document.getElementById('btn-start-compass')?.addEventListener('click', () => this.requestCompassPermission());
    }

    // --- LLOGARITJA E KOHËS DHE HERO CARD ---
    updateClock() {
        // Këtu në një skenar real do të përdornim prayerTimesService.getTimesForDate()
        // Për momentin po e bëjmë me logjikë bazë për UI-në.
        
        const now = new Date();
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        
        const hijriDateEl = document.getElementById('header-hijri-date');
        if(hijriDateEl) hijriDateEl.innerText = now.toLocaleDateString('sq-AL', dateOptions);

        // Ndrysho statuset e kartave (nëse janë falur)
        this.refreshPrayerCardsUI();
    }

    refreshPrayerCardsUI() {
        const today = new Date().toISOString().split('T')[0];
        const todaysLogs = this.prayerLogs[today] || {};

        ['sabahu', 'dreka', 'ikindia', 'akshami', 'jacia'].forEach(prayer => {
            const card = document.getElementById(`card-${prayer}`);
            if(!card) return;
            
            const circle = card.querySelector('.status-circle');
            if (todaysLogs[prayer]) {
                circle.innerHTML = '✓';
                circle.style.borderColor = '#10B981';
                circle.style.color = '#10B981';
                circle.style.background = 'rgba(16, 185, 129, 0.1)';
            } else {
                circle.innerHTML = '';
                circle.style.borderColor = '#374151';
                circle.style.background = 'transparent';
            }
        });
    }

    // --- LOGIMI I NAMAZIT ---
    openPrayerLog(prayerId) {
        this.currentPrayerSelection = {
            id: prayerId,
            date: new Date().toISOString().split('T')[0],
            method: 'alone', // default
            sunnahs: []
        };

        const titleMap = { sabahu: 'Sabahu', dreka: 'Dreka', ikindia: 'Ikindia', akshami: 'Akshami', jacia: 'Jacia' };
        document.getElementById('log-prayer-title').innerText = titleMap[prayerId] || prayerId;
        
        // Fshi selektimet e vjetra
        document.querySelectorAll('.method-btn .radio-circle').forEach(c => c.style.background = 'transparent');
        document.querySelector('.method-btn[data-method="alone"] .radio-circle').style.background = '#3B82F6';
        document.getElementById('prayer-note').value = '';

        this.renderSunnahOptions(prayerId);
        this.showPage('log');
    }

    renderSunnahOptions(prayerId) {
        const container = document.getElementById('sunnah-list-container');
        const hadithText = document.getElementById('sunnah-hadith-text');
        container.innerHTML = '';
        
        if (!this.sunnahData || !this.sunnahData.prayers[prayerId] || !this.sunnahData.prayers[prayerId].sunnah) {
            container.innerHTML = '<p style="color: #9CA3AF; font-size: 14px; margin: 0;">Nuk ka sunete të theksuara për këtë kohë.</p>';
            hadithText.innerText = "Kjo kohë përbëhet kryesisht nga farzi.";
            return;
        }

        const sunnahs = this.sunnahData.prayers[prayerId].sunnah;
        hadithText.innerText = sunnahs[0]?.hadith || "Kush fal 12 rekate sunet në ditë, Allahu i ndërton një shtëpi në Xhenet.";

        sunnahs.forEach(s => {
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';
            div.innerHTML = `
                <span style="color: white; font-size: 15px;">${s.label}</span>
                <input type="checkbox" style="width: 20px; height: 20px;" checked data-id="${s.id}">
            `;
            container.appendChild(div);
        });
    }

    savePrayerLog() {
        const today = this.currentPrayerSelection.date;
        if (!this.prayerLogs[today]) this.prayerLogs[today] = {};
        
        // Mblidh sunetet e bëra check
        const checkboxes = document.querySelectorAll('#sunnah-list-container input[type="checkbox"]:checked');
        checkboxes.forEach(cb => this.currentPrayerSelection.sunnahs.push(cb.dataset.id));
        
        this.currentPrayerSelection.note = document.getElementById('prayer-note').value;
        
        this.prayerLogs[today][this.currentPrayerSelection.id] = this.currentPrayerSelection;
        localStorage.setItem('prayer_logs', JSON.stringify(this.prayerLogs));
    }

    // --- DHIKRI PAS NAMAZIT ---
    startDhikr() {
        if (!this.dhikrData) return;
        this.currentDhikrIndex = 0;
        this.dhikrCount = 0;
        this.showPage('dhikr');
        this.renderCurrentDhikr();
    }

    renderCurrentDhikr() {
        const dhikrList = this.dhikrData.sequence;
        if (this.currentDhikrIndex >= dhikrList.length) {
            alert("Dhikri përfundoi. Allahu ta pranoftë!");
            this.showPage('main');
            return;
        }

        const item = dhikrList[this.currentDhikrIndex];
        document.getElementById('dhikr-arabic').innerText = item.arabic;
        document.getElementById('dhikr-latin').innerText = item.latin;
        document.getElementById('dhikr-translation').innerText = item.translation;
        document.getElementById('dhikr-source').innerText = item.source;
        
        this.dhikrCount = item.repeat;
        this.updateDhikrCounterUI();
        
        const progress = ((this.currentDhikrIndex) / dhikrList.length) * 100;
        document.getElementById('dhikr-progress-fill').style.width = `${progress}%`;
        document.getElementById('dhikr-progress-text').innerText = `${this.currentDhikrIndex + 1} / ${dhikrList.length}`;
    }

    handleDhikrTap() {
        const btn = document.getElementById('btn-tap-dhikr');
        // Animation
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = 'scale(1)', 100);

        if (this.dhikrCount > 1) {
            this.dhikrCount--;
            this.updateDhikrCounterUI();
        } else {
            // Kalo te dhikri tjetër
            this.currentDhikrIndex++;
            this.renderCurrentDhikr();
        }
    }

    updateDhikrCounterUI() {
        document.getElementById('dhikr-count').innerText = this.dhikrCount;
        document.getElementById('dhikr-remaining').innerText = this.dhikrCount;
    }

    // --- KIBLA (KOMPASI) ---
    initQibla() {
        // Drejtimi i Kiblës për Shqipërinë është afërsisht 137 gradë (Jug-Lindje)
        this.qiblaAngle = 137; 
        document.getElementById('qibla-degree').innerText = `${this.qiblaAngle}° SE`;
        document.getElementById('qibla-location').innerText = "Tiranë, AL";
    }

    requestCompassPermission() {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        this.startCompass();
                    } else {
                        alert("Ju lutem lejoni qasjen te sensorët për të përdorur busullën.");
                    }
                })
                .catch(console.error);
        } else {
            this.startCompass(); // Për Android dhe shfletues të tjerë
        }
    }

    startCompass() {
        document.getElementById('btn-start-compass').style.display = 'none';
        document.getElementById('qibla-status').innerText = "Busulla është aktive";
        document.getElementById('qibla-status').style.color = "#10B981";

        window.addEventListener('deviceorientation', (event) => {
            let alpha = event.webkitCompassHeading || Math.abs(event.alpha - 360);
            
            // Rrotullo busullën sipas veriut
            const compass = document.getElementById('compass-container');
            compass.style.transform = `rotate(${-alpha}deg)`;
            
            // Shigjeta e Qabes
            const qiblaPointer = document.getElementById('qibla-pointer');
            qiblaPointer.style.transform = `rotate(${this.qiblaAngle}deg)`;
            
            // Ndrysho ngjyrën nëse është në drejtimin e duhur (+/- 5 gradë)
            let diff = Math.abs(alpha - this.qiblaAngle);
            if (diff < 5 || diff > 355) {
                compass.style.borderColor = "#10B981"; // Jeshile
                compass.style.boxShadow = "0 0 30px rgba(16, 185, 129, 0.4)";
                if ('vibrate' in navigator) navigator.vibrate(50); // Dridhje e lehtë
            } else {
                compass.style.borderColor = "#374151";
                compass.style.boxShadow = "0 10px 30px rgba(0,0,0,0.5)";
            }
        });
    }

    // --- STATISTIKAT ---
    updateStats() {
        let totalPrayers = 0;
        let streak = 0;
        let mosque = 0, jamaah = 0, alone = 0, qada = 0;

        // Llogarit streak (ditët radhazi)
        const dates = Object.keys(this.prayerLogs).sort().reverse();
        
        dates.forEach(date => {
            const dayLogs = this.prayerLogs[date];
            const prayerCount = Object.keys(dayLogs).length;
            totalPrayers += prayerCount;

            Object.values(dayLogs).forEach(log => {
                if(log.method === 'mosque_congregation') mosque++;
                if(log.method === 'home_congregation') jamaah++;
                if(log.method === 'alone') alone++;
                if(log.method === 'qada') qada++;
            });
        });

        // Update UI
        document.getElementById('stats-streak-count').innerText = dates.length; // Simplifikim për demo
        document.getElementById('stats-total-prayers').innerText = totalPrayers;
        
        document.getElementById('stat-mosque-count').innerText = mosque;
        document.getElementById('stat-jamaah-count').innerText = jamaah;
        document.getElementById('stat-alone-count').innerText = alone;
        document.getElementById('stat-qada-count').innerText = qada;

        // Llogarit % për shiritat e progresit
        if(totalPrayers > 0) {
            document.getElementById('stat-mosque-bar').style.width = `${(mosque/totalPrayers)*100}%`;
            document.getElementById('stat-jamaah-bar').style.width = `${(jamaah/totalPrayers)*100}%`;
            document.getElementById('stat-alone-bar').style.width = `${(alone/totalPrayers)*100}%`;
            document.getElementById('stat-qada-bar').style.width = `${(qada/totalPrayers)*100}%`;
        }
    }
}

// Incializo modulin kur të ngarkohet DOM
document.addEventListener('DOMContentLoaded', () => {
    window.prayerApp = new PrayerModule();
});
