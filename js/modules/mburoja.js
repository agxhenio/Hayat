/**
 * Mburoja Module (mburoja.js)
 */

import { Storage } from '../core/storage.js';
import { mburojaDetailModule } from './dua-detail.js';

class MburojaModule {
  constructor() {
    this.categories = [];
    this.currentCategoryData = null;
    
    document.addEventListener('pageLoaded', (e) => {
      if (e.detail.path === '/mburoja') {
        this.mount();
      }
    });
  }

  async mount() {
    await this.loadCategories();
    this.renderCategories();
    this.renderFavorites();
    if (window.lucide) window.lucide.createIcons();
  }

  async loadCategories() {
    try {
      const res = await fetch('data/categories.json');
      this.categories = await res.json();
    } catch (e) {
      console.error(e);
    }
  }

  renderCategories() {
    const list = document.getElementById('mburoja-categories-list');
    if (!list) return;

    list.style.display = 'grid';
    list.style.gridTemplateColumns = 'repeat(2, 1fr)';
    list.style.gap = 'var(--space-4)';

    let html = '';
    this.categories.forEach(cat => {
      // Perdorur thonjeza teke per te mos ngaterruar editorin e telefonit
      html += '<div class="mburoja-box" data-cat-id="' + cat.id + '">' +
              '<div class="mburoja-box-icon" style="border: 1px solid ' + cat.color + '40; box-shadow: 0 4px 12px ' + cat.color + '15;">' +
              '<i data-lucide="' + cat.icon + '" style="color: ' + cat.color + '; width: 28px; height: 28px;"></i>' +
              '</div>' +
              '<h3 style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); margin-bottom: 4px; line-height: 1.3;">' + cat.name + '</h3>' +
              '<p style="font-size: var(--font-size-xs); color: var(--color-text-tertiary); margin: 0;">' + cat.count + '</p>' +
              '</div>';
    });
    list.innerHTML = html;

    list.onclick = (e) => {
      const box = e.target.closest('.mburoja-box');
      if (!box) return;
      
      const catId = box.getAttribute('data-cat-id');
      box.style.opacity = '0.5';
      setTimeout(() => { box.style.opacity = '1'; }, 200);

      if (catId === 'mengjes_mbremje') {
        window.location.hash = '#/dhikr';
      } else {
        this.openCategory(catId);
      }
    };
  }

  renderFavorites() {
    const container = document.getElementById('mburoja-favorites-container');
    if (!container) return;
    const favs = Storage.get('mburoja_favorites', []);

    if (favs.length === 0) {
      container.innerHTML = '<div style="padding: var(--space-4); text-align: center; width: 100%; color: var(--color-text-tertiary); font-size: var(--font-size-sm); border: 1px dashed var(--color-border); border-radius: var(--radius-lg);">' +
                            'Nuk ke asnjë lutje të zgjedhur.<br>Prek ikonën ⭐ te çdo lutje.' +
                            '</div>';
      return;
    }

    container.innerHTML = '<div class="fav-card" style="display:flex; flex-direction:column; justify-content:center; align-items:center;">' +
                          '<i data-lucide="star" style="color: var(--color-accent-gold); margin-bottom: var(--space-2);"></i>' +
                          '<p style="font-size: var(--font-size-sm); text-align:center;">Ke ' + favs.length + ' lutje<br>në të Zgjedhurat</p>' +
                          '</div>';
  }

  async openCategory(categoryId) {
    try {
      const jsonName = categoryId.split('_')[0]; 
      
      const list = document.getElementById('mburoja-categories-list');
      const loadingMsg = document.createElement('div');
      loadingMsg.id = 'temp-loading-msg';
      loadingMsg.style = "grid-column: 1 / -1; text-align: center; color: var(--color-accent-gold); padding: 10px;";
      loadingMsg.innerHTML = "Duke hapur...";
      list.prepend(loadingMsg);

      const res = await fetch('data/duas/duas-' + jsonName + '.json');
      if (!res.ok) throw new Error("Mungon skedari i lutjeve: duas-" + jsonName + ".json");
      this.currentCategoryData = await res.json();
      
      const catHtmlResponse = await fetch('pages/mburoja-category.html');
      const catHtml = await catHtmlResponse.text();
      
      if(document.getElementById('temp-loading-msg')) {
        document.getElementById('temp-loading-msg').remove();
      }

      const wrapper = document.createElement('div');
      wrapper.innerHTML = catHtml;
      
      const page = wrapper.querySelector('.mburoja-category-page');
      
      if (!page || !page.querySelector('#category-title')) {
        throw new Error("Skedari 'pages/mburoja-category.html' është bosh ose i pasaktë!");
      }
      
      document.body.appendChild(page);
      
      page.querySelector('#category-title').textContent = this.currentCategoryData.category_name;
      page.querySelector('#category-count').textContent = this.currentCategoryData.duas.length + ' lutje';
      
      let listHtml = '';
      this.currentCategoryData.duas.forEach(dua => {
        listHtml += '<div class="dua-item-card" data-dua-id="' + dua.id + '" style="cursor:pointer; display:flex; align-items:center; justify-content:space-between; padding:var(--space-4); background-color:var(--color-bg-elevated); border-radius:var(--radius-md); margin-bottom:var(--space-2);">' +
                    '<div style="flex: 1;">' +
                    '<h4 style="font-size: var(--font-size-base); color: var(--color-text-primary); margin-bottom: 2px;">' + dua.name + '</h4>' +
                    '<p style="font-size: var(--font-size-xs); color: var(--color-text-tertiary); margin: 0;">' + dua.short_description + '</p>' +
                    '</div>' +
                    '<div class="badge" style="margin-inline-end: var(--space-3);">' + dua.repeat + 'x</div>' +
                    '<i data-lucide="chevron-right" style="color: var(--color-text-tertiary);"></i>' +
                    '</div>';
      });
      
      const listContainer = page.querySelector('#category-duas-list');
      listContainer.innerHTML = listHtml;
      if (window.lucide) window.lucide.createIcons();

      listContainer.onclick = (e) => {
        const card = e.target.closest('.dua-item-card');
        if (!card) return;
        
        card.style.opacity = '0.5';
        setTimeout(() => { card.style.opacity = '1'; }, 200);

        const duaId = card.getAttribute('data-dua-id');
        this.openDua(duaId);
      };

      const backBtn = page.querySelector('.btn-back-to-home');
      if (backBtn) {
        backBtn.onclick = () => {
          page.style.transform = 'translateY(100%)';
          setTimeout(() => { page.remove(); }, 300);
        };
      }

    } catch (e) {
      console.warn(e);
      if(document.getElementById('temp-loading-msg')) document.getElementById('temp-loading-msg').remove();
      
      const errDiv = document.createElement('div');
      errDiv.style = "position:fixed; bottom: 80px; left: 20px; right: 20px; background: var(--color-danger); color: white; padding: 15px; border-radius: 8px; z-index: 9999; box-shadow: 0 4px 10px rgba(0,0,0,0.5); font-size: 14px;";
      errDiv.innerHTML = '<b>Ndodhi një gabim:</b> <br>' + e.message;
      document.body.appendChild(errDiv);
      
      setTimeout(() => { errDiv.remove(); }, 6000);
    }
  }

  openDua(duaId) {
    if (!this.currentCategoryData) return;
    const dua = this.currentCategoryData.duas.find(d => d.id === duaId);
    if (!dua) return;
    mburojaDetailModule.open(dua);
  }
}

export const mburojaModule = new MburojaModule();
