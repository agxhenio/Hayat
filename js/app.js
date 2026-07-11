// 📄 js/app.js
import { router } from './router.js';
import { events } from './core/events.js';
import { storage } from './core/storage.js';
import { ui } from './core/ui.js';

class HayatApp {
    constructor() {
        this.init();
    }

    init() {
        console.log('Bismillah! Hayat App Initializing...');
        
        // Fillo Ndërfaqen (Bottom Sheets, Modalet)
        ui.init();
        
        // Fillo ikonat për shell-in
        if (window.lucide) {
            lucide.createIcons();
        }

        // Fillo routerin (Navigimin)
        router.init();

        // Dëgjo evente globale
        this.setupGlobalEvents();
        
        // Kontrollo nëse përdoruesi hyn për herë të parë
        this.checkFirstVisit();
    }

    setupGlobalEvents() {
        events.on('routeChanged', (data) => {
            console.log(`Naviguam tek: ${data.path}`);
            // Këtu mund të fusim logjikë specifike kur ndërrojmë faqe
            // P.sh. të lëshojmë evente për Analytics
        });
    }

    checkFirstVisit() {
        const isFirstVisit = storage.get('isFirstVisit', true);
        if (isFirstVisit) {
            console.log('Welcome to Hayat!');
            // Këtu mund të hapim një Modal "Welcome/Onboarding" më vonë
            storage.set('isFirstVisit', false);
        }
    }
}

// Nis Aplikacionin kur DOM është gati
document.addEventListener('DOMContentLoaded', () => {
    window.app = new HayatApp();
});
