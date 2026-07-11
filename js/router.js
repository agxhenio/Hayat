// 📄 js/router.js
import { events } from './core/events.js';
import { dashboardModule } from './modules/dashboard.js';
import { dhikrModule } from './modules/dhikr.js';

export const router = {
    viewContainer: null,
    routes: {
        '/': 'pages/dashboard.html',
        '/explore': 'pages/explore.html',
        '/namazi': 'pages/prayer.html', 
        '/kurani': 'pages/quran.html',
        '/dhikr': 'pages/dhikr.html',
        '/menu': 'pages/settings.html'
    },

    init() {
        this.viewContainer = document.getElementById('app-view');
        
        window.addEventListener('hashchange', () => this.handleRoute());
        
        if (!window.location.hash) {
            window.location.hash = '/';
        } else {
            this.handleRoute();
        }
    },

    async handleRoute() {
        let path = window.location.hash.slice(1) || '/';
        
        // Logjikë për të pikasur rrugët dinamike (p.sh. /dhikr/kategori/1)
        let templatePath = this.routes[path];
        let categoryId = null;

        if (path.startsWith('/dhikr/kategori/')) {
            categoryId = path.split('/').pop();
            templatePath = 'pages/dhikr-category.html'; // Përdor faqen e listës së kategorive
        }

        if (templatePath) {
            await this.loadView(templatePath);
            this.updateActiveNav(path);
            
            // Inicializimi i moduleve sipas faqes
            if (path === '/') {
                setTimeout(() => { dashboardModule.init(); }, 50);
            } else if (path === '/dhikr') {
                setTimeout(() => { dhikrModule.init(); }, 50);
            } else if (categoryId) {
                // Nëse jemi brenda një kategorie, ngarkojmë listën e saj specifike
                setTimeout(() => { dhikrModule.initCategoryView(categoryId); }, 50);
            }
            
            events.emit('routeChanged', { path });
        } else {
            this.viewContainer.innerHTML = '<div class="container text-center text-secondary" style="padding: 40px 0;">404 - Faqja nuk u gjet</div>';
        }
    },

    async loadView(templatePath) {
        try {
            this.viewContainer.style.opacity = '0.5';
            
            const response = await fetch(templatePath);
            const html = await response.text();
            
            this.viewContainer.innerHTML = html;
            this.viewContainer.style.opacity = '1';
            
            if (window.lucide) {
                window.lucide.createIcons();
            }
        } catch (error) {
            console.error('Error loading view:', error);
            this.viewContainer.innerHTML = '<div class="container text-danger">Ndodhi një gabim në ngarkimin e faqes.</div>';
        }
    },

    updateActiveNav(currentPath) {
        const navItems = document.querySelectorAll('.bottom-nav__item');
        navItems.forEach(item => {
            const itemRoute = item.getAttribute('data-route');
            if (currentPath.startsWith(itemRoute) && itemRoute !== '/' || (currentPath === '/' && itemRoute === '/')) {
                item.classList.add('is-active');
            } else {
                item.classList.remove('is-active');
            }
        });
    }
};
