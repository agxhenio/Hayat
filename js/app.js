/**
 * Main Entry Point (app.js)
 * Inicializon PWA, Router dhe Modulet Baze
 */

import { Router } from './router.js';
import { Storage } from './core/storage.js';
import { Utils } from './core/utils.js';

import './modules/dashboard.js'; 
import './modules/prayer.js';
import './modules/dhikr.js'; 
import './modules/mburoja.js'; // Shto këtë linjë!


class HayatApp {
  constructor() {
    this.init();
  }

  init() {
    console.log('[Hayat] Bismillah - Inicializimi i aplikacionit...');
    
    // 1. Inicializo Ikonat (Lucide)
    if (window.lucide) {
      lucide.createIcons();
    }

    // 2. Regjistro Service Worker (Për PWA & Offline Support)
    this.registerServiceWorker();

    // 3. Apliko temën e ruajtur (Dark/Light)
    this.applyTheme();

    // 4. Nis Router-in (Menaxhon navigimin)
    Router.init();
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(registration => {
            console.log('[SW] Regjistruar me sukses:', registration.scope);
          })
          .catch(error => {
            console.error('[SW] Dështoi regjistrimi:', error);
          });
      });
    }
  }

  applyTheme() {
    const savedTheme = Storage.get('theme', 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new HayatApp();
});
