/**
 * Dua Detail Module (dua-detail.js)
 */

import { Storage } from '../core/storage.js';

class MburojaDetailModule {
  constructor() {
    this.currentDua = null;
    this.count = 0;
  }

  async open(duaData) {
    this.currentDua = duaData;
    this.count = 0;

    try {
      // 1. Marrim HTML e faqes
      const htmlResponse = await fetch('pages/mburoja-dua.html');
      if (!htmlResponse.ok) throw new Error("Mungon skedari: pages/mburoja-dua.html");
      const html = await htmlResponse.text();
      
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      
      const page = wrapper.firstElementChild;
      if (!page || !page.querySelector('#dua-title')) {
        throw new Error("Skedari 'pages/mburoja-dua.html' është bosh ose i pasaktë!");
      }

      document.body.appendChild(page);
      this.page = page;
      
      this.cacheDOM();
      this.populateData();
      this.bindEvents();
      
      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      console.warn(e);
      this.showError(e.message);
    }
  }

  showError(msg) {
    const errDiv = document.createElement('div');
    errDiv.style = "position:fixed; bottom: 80px; left: 20px; right: 20px; background: var(--color-danger); color: white; padding: 15px; border-radius: 8px; z-index: 9999; box-shadow: 0 4px 10px rgba(0,0,0,0.5); font-size: 14px;";
    errDiv.innerHTML = `<b>Ndodhi një gabim:</b> <br> ${msg} <br><br><i>Sigurohu që e ke krijuar dhe ruajtur këtë skedar!</i>`;
    document.body.appendChild(errDiv);
    setTimeout(() => errDiv.remove(), 6000);
  }

  cacheDOM() {
    this.btnBack = this.page.querySelector('.btn-back-to-category');
    this.btnFav = this.page.querySelector('#btn-toggle-favorite');
    this.btnFavIcon = this.btnFav.querySelector('i');
    
    this.progressText = this.page.querySelector('#dua-progress-text');
    this.checkIcon = this.page.querySelector('#dua-check-icon');
    
    this.tapArea = this.page.querySelector('#dua-tap-area');
    
    this.dTitle = this.page.querySelector('#dua-title');
    this.dBadge = this.page.querySelector('#dua-repeat-badge');
    this.dContext = this.page.querySelector('#dua-context');
    this.dArabic = this.page.querySelector('#dua-arabic');
    this.dTransl = this.page.querySelector('#dua-transliteration');
    this.dTrans = this.page.querySelector('#dua-translation');
    this.dVirtueBox = this.page.querySelector('#dua-virtue-card');
    this.dVirtue = this.page.querySelector('#dua-virtue');
    this.dSource = this.page.querySelector('#dua-source');
  }

  populateData() {
    const d = this.currentDua;
    
    this.dTitle.textContent = d.name;
    this.dBadge.textContent = `${d.repeat}x`;
    
    // Këtu i tregojmë javascriptit të respektojë paragrafët (\n) për suret e gjata
    this.dArabic.innerHTML = d.arabic.replace(/\n/g, '<br><br>');
    this.dTransl.innerHTML = d.transliteration.replace(/\n/g, '<br><br>');
    this.dTrans.innerHTML = d.translation.replace(/\n/g, '<br><br>');
    
    this.dSource.textContent = d.source || "Hisnul Muslim";
    
    if (d.context_note) {
      this.dContext.textContent = d.context_note;
      this.dContext.style.display = 'block';
    } else {
      this.dContext.style.display = 'none';
    }

    if (d.virtue) {
      this.dVirtue.textContent = d.virtue;
      this.dVirtueBox.style.display = 'block';
    } else {
      this.dVirtueBox.style.display = 'none';
    }

    this.updateCounterUI();
    this.updateFavoriteUI();
  }

  bindEvents() {
    // Mbyllja me animacion
    this.btnBack.addEventListener('click', () => {
      this.page.style.transform = 'translateY(100%)';
      setTimeout(() => this.page.remove(), 300);
    });

    this.btnFav.addEventListener('click', () => this.toggleFavorite());
    this.tapArea.addEventListener('click', () => this.handleTap());
    
    // Feedback vizual për prekjen e kutisë
    this.tapArea.addEventListener('touchstart', () => { this.tapArea.style.opacity = '0.7'; }, { passive: true });
    this.tapArea.addEventListener('touchend', () => { this.tapArea.style.opacity = '1'; }, { passive: true });
  }

  handleTap() {
    if (this.count < this.currentDua.repeat) {
      this.count++;
      this.updateCounterUI();
      
      if (this.count === this.currentDua.repeat) {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        this.tapArea.style.borderColor = 'var(--color-success)';
        this.checkIcon.style.color = 'var(--color-success)';
      } else {
        if (navigator.vibrate) navigator.vibrate(15);
      }
    }
  }

  updateCounterUI() {
    this.progressText.textContent = `${this.count} / ${this.currentDua.repeat}`;
  }

  toggleFavorite() {
    let favs = Storage.get('mburoja_favorites', []);
    const id = this.currentDua.id;
    
    if (favs.includes(id)) {
      favs = favs.filter(f => f !== id);
    } else {
      favs.push(id);
    }
    
    Storage.set('mburoja_favorites', favs);
    this.updateFavoriteUI();
    
    if (window.appModules && window.appModules.mburoja) {
      window.appModules.mburoja.renderFavorites();
    }
  }

  updateFavoriteUI() {
    const favs = Storage.get('mburoja_favorites', []);
    if (favs.includes(this.currentDua.id)) {
      this.btnFav.style.color = 'var(--color-danger)';
      this.btnFavIcon.setAttribute('fill', 'var(--color-danger)');
    } else {
      this.btnFav.style.color = 'inherit';
      this.btnFavIcon.setAttribute('fill', 'none');
    }
  }
}

export const mburojaDetailModule = new MburojaDetailModule();
