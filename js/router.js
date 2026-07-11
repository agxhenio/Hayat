/**
 * Router Module (router.js)
 * Menaxhon navigimin midis faqeve pa rifreskuar browserin
 */

export const Router = {
  appContent: document.getElementById('app-content'),
  navItems: document.querySelectorAll('.nav-item'),
  
  routes: {
    '/dashboard': 'pages/dashboard.html',
    '/quran': 'pages/quran.html',
    '/prayer': 'pages/prayer.html',
    '/mburoja': 'pages/mburoja.html',
    '/dhikr': 'pages/dhikr.html',
    '/settings': 'pages/settings.html',
  },

  init() {
    // Dëgjo për ndryshime në URL (Hash)
    window.addEventListener('hashchange', this.handleRoute.bind(this));
    
    // Ngarko faqen e parë kur hapet aplikacioni
    if (!window.location.hash) {
      window.location.hash = '#/dashboard';
    } else {
      this.handleRoute();
    }
  },

  async handleRoute() {
    // Merr path-in nga URL (p.sh. ng "#/dashboard" bëhet "/dashboard")
    let path = window.location.hash.slice(1) || '/dashboard';
    
    // Nësë path-i nuk ekziston, kthehu në dashboard
    if (!this.routes[path]) {
      path = '/dashboard';
      window.location.hash = '#' + path;
      return;
    }

    try {
      // 1. Shfaq loading state të thjeshtë
      this.appContent.innerHTML = `<div style="display:flex; height:100%; justify-content:center; align-items:center;"><div class="spinner--islamic"></div></div>`;
      
      // 2. Fetch HTML-në e faqes
      const response = await fetch(this.routes[path]);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const html = await response.text();
      
      // 3. Injekto HTML
      this.appContent.innerHTML = html;
      
      // 4. Update CSS dhe Icons
      this.updateActiveNav(path);
      if (window.lucide) window.lucide.createIcons();
      
      // 5. Ritransmeto një event global në mënyrë që modulet të nisin logjikën e tyre
      document.dispatchEvent(new CustomEvent('pageLoaded', { detail: { path } }));

    } catch (error) {
      console.error('[Router] Error loading page:', error);
      this.appContent.innerHTML = `
        <div style="padding: var(--space-6); text-align: center;">
          <i data-lucide="alert-circle" style="color: var(--color-danger); width: 48px; height: 48px; margin-bottom: var(--space-4);"></i>
          <h3>Ndodhi një gabim</h3>
          <p>Faqja nuk mund të ngarkohej. Ju lutem provoni përsëri.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
    }
  },

  updateActiveNav(currentPath) {
    const routeName = currentPath.replace('/', '');
    this.navItems.forEach(item => {
      if (item.dataset.route === routeName) {
        item.classList.add('is-active');
      } else {
        item.classList.remove('is-active');
      }
    });
  }
};
