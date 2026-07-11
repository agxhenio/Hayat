// 📄 js/modules/dhikr.js

export const dhikrModule = {
    cachedData: null,

    async init() {
        console.log('Moduli i Dhikrit u inicializua');
        this.bindSearch();
        await this.renderFavorites(); // Vizaton të preferuarat sapo hapet faqja
    },

    async loadData() {
        if (this.cachedData) return this.cachedData;
        try {
            const res = await fetch('data/hisnul_muslim.json');
            this.cachedData = await res.json();
            return this.cachedData;
        } catch (e) {
            console.error("Gabim gjatë ngarkimit të datave të dhikrit:", e);
            return null;
        }
    },

    // --- LOGJIKA E TË PREFERUARAVE (FAVORITES) ---
    getFavorites() {
        return JSON.parse(localStorage.getItem('hayat_favorite_duas') || '[]');
    },

    isFavorite(duaId) {
        const favs = this.getFavorites();
        return favs.some(f => f.id == duaId);
    },

    toggleFavorite(duaId, categoryId) {
        let favs = this.getFavorites();
        const index = favs.findIndex(f => f.id == duaId);
        let added = false;

        if (index > -1) {
            favs.splice(index, 1); // E heq nëse ekziston
        } else {
            favs.push({ id: duaId, categoryId: categoryId }); // E shton nëse s'ekziston
            added = true;
        }

        localStorage.setItem('hayat_favorite_duas', JSON.stringify(favs));
        return added;
    },

    async renderFavorites() {
        const container = document.getElementById('favorites-carousel');
        if (!container) return;

        const favs = this.getFavorites();
        
        if (favs.length === 0) {
            container.innerHTML = `
                <div style="width: 100%; padding: var(--space-4); text-align: center; border: 1px dashed var(--color-border); border-radius: var(--radius-lg); color: var(--color-text-tertiary); font-size: 13px;">
                    Nuk keni ruajtur ende asnjë lutje.<br>Klikoni ikonën e "Bookmark" për t'i shtuar këtu.
                </div>
            `;
            return;
        }

        const data = await this.loadData();
        if (!data) return;

        let html = '';
        favs.forEach(fav => {
            const category = data.categories.find(c => c.id == fav.categoryId);
            if (category) {
                const dua = category.duas.find(d => d.id == fav.id);
                if (dua) {
                    html += `
                        <div class="card js-open-fav" data-cat="${fav.categoryId}" data-id="${fav.id}" style="min-width: 140px; padding: var(--space-3); background: var(--color-bg-elevated); cursor: pointer;">
                            <div style="background: var(--color-accent-teal-alpha); width: 32px; height: 32px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-2);">
                                <i data-lucide="bookmark" style="width: 16px; color: var(--color-accent-teal); fill: var(--color-accent-teal);"></i>
                            </div>
                            <h4 class="font-semibold text-sm line-clamp-2" style="font-size: 13px;">${dua.title}</h4>
                        </div>
                    `;
                }
            }
        });

        container.innerHTML = html;
        if (window.lucide) window.lucide.createIcons();

        // Lidhim klikimin e kartave të të preferuarave që t'i hapë direkt
        container.querySelectorAll('.js-open-fav').forEach(item => {
            item.addEventListener('click', () => {
                const catId = item.getAttribute('data-cat');
                const duaId = item.getAttribute('data-id');
                const cat = data.categories.find(c => c.id == catId);
                const duaIndex = cat.duas.findIndex(d => d.id == duaId);
                this.openDuaBottomSheet(cat.duas, duaIndex, catId);
            });
        });
    },
    // ---------------------------------------------

    async initCategoryView(categoryId) {
        const data = await this.loadData();
        if (!data) return;

        const category = data.categories.find(c => c.id == categoryId);
        const titleEl = document.getElementById('category-title');
        const subtitleEl = document.getElementById('category-subtitle');
        const listContainer = document.getElementById('duas-list');

        if (!category || !listContainer) return;

        if (titleEl) titleEl.innerText = category.name;
        if (subtitleEl) subtitleEl.innerText = `${category.count} lutje gjithsej`;

        let listHTML = '';
        category.duas.forEach((dua, index) => {
            listHTML += `
                <div class="card js-open-dua" data-index="${index}" style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4); background: var(--color-bg-elevated); border: 1px solid var(--color-border); cursor: pointer;">
                    <div style="font-size: 14px; font-weight: 700; color: var(--color-accent-teal); min-width: 24px;">
                        ${dua.id}.
                    </div>
                    <div style="flex-grow: 1; font-weight: 600; font-size: 14px; color: var(--color-text-primary);">
                        ${dua.title}
                    </div>
                    <i data-lucide="chevron-right" style="width: 16px; color: var(--color-text-tertiary);"></i>
                </div>
            `;
        });

        listContainer.innerHTML = listHTML;
        if (window.lucide) window.lucide.createIcons();

        this.bindDuaClicks(category.duas, categoryId);
    },

    bindDuaClicks(categoryDuas, categoryId) {
        const items = document.querySelectorAll('.js-open-dua');
        items.forEach(item => {
            item.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                this.openDuaBottomSheet(categoryDuas, index, categoryId);
            });
        });
    },

        openDuaBottomSheet(categoryDuas, currentIndex, categoryId) {
        const dua = categoryDuas[currentIndex];
        const isFav = this.isFavorite(dua.id); 
        
        import('../core/ui.js').then(({ ui }) => {
            const sheetHTML = `
                <div style="padding-bottom: var(--space-4);" id="dua-reader-content">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
                        <span class="badge badge--teal" style="font-size: 11px;">Lutja ${dua.id}</span>
                        <div style="display: flex; gap: var(--space-2);">
                            <button id="bookmark-btn" class="btn btn--icon btn--secondary" style="border-radius: var(--radius-full); width: 36px; height: 36px; color: ${isFav ? 'var(--color-accent-teal)' : 'var(--color-text-secondary)'};">
                                <i data-lucide="bookmark" style="width: 16px; ${isFav ? 'fill: currentColor;' : ''}"></i>
                            </button>
                            <!-- Mbyllja tani do të ndalojë edhe audion nëse është duke luajtur -->
                            <button class="btn btn--icon btn--secondary" id="close-sheet-btn" style="border-radius: var(--radius-full); width: 36px; height: 36px;">
                                <i data-lucide="x" style="width: 16px; color: var(--color-text-secondary);"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Butoni i Audios i përditësuar -->
                    <button id="audio-btn" data-audio-src="${dua.audio || ''}" class="btn btn--secondary flex-row" style="gap: 6px; width: 100%; justify-content: center; margin-bottom: var(--space-4); border-radius: var(--radius-md); padding: 10px; ${!dua.audio ? 'opacity: 0.5; pointer-events: none;' : ''}">
                        <i data-lucide="play" id="audio-icon" style="width: 16px; fill: currentColor;"></i>
                        <span id="audio-text" style="font-size: 13px; font-weight: 600;">${dua.audio ? 'Dëgjo Audion' : 'Audio nuk ofrohet'}</span>
                    </button>

                    <div class="quran-text" style="color: var(--color-accent-gold); font-size: 24px; text-align: right; line-height: 2; margin-bottom: var(--space-4); direction: rtl;">
                        ${dua.arabic}
                    </div>

                    <p style="font-size: 13px; font-style: italic; color: var(--color-text-secondary); line-height: 1.5; margin-bottom: var(--space-3); border-left: 2px solid var(--color-accent-teal); padding-left: var(--space-2);">
                        "${dua.transliteration}"
                    </p>

                    <p style="font-size: 14px; font-weight: 500; color: var(--color-text-primary); line-height: 1.6; margin-bottom: var(--space-4);">
                        ${dua.translation}
                    </p>

                    <button id="counter-btn" data-max="${dua.count}" class="btn btn--primary" style="width: 100%; padding: var(--space-3); font-weight: 700; border-radius: var(--radius-lg); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; background: var(--color-accent-teal);">
                        <span id="counter-title" style="font-size: 16px;">Kliko për të numëruar</span>
                        <span id="counter-display" style="font-size: 12px; opacity: 0.8;">Përsërit: 0 / ${dua.count}</span>
                    </button>
                </div>
            `;
            
            const existingContent = document.getElementById('dua-reader-content');
            if (existingContent) {
                // Fikim audion e mëparshme nëse po luan kur bëjmë auto-next
                if (window.currentDuaAudio) {
                    window.currentDuaAudio.pause();
                    window.currentDuaAudio = null;
                }
                
                existingContent.parentElement.innerHTML = sheetHTML;
                if (window.lucide) window.lucide.createIcons();
                this.initCounterLogic(categoryDuas, currentIndex, categoryId);
                this.initBookmarkLogic(dua.id, categoryId);
                this.initAudioLogic();
            } else {
                ui.openBottomSheet(sheetHTML);
                this.initCounterLogic(categoryDuas, currentIndex, categoryId);
                this.initBookmarkLogic(dua.id, categoryId);
                this.initAudioLogic();
            }

            // Mbyllja e overlay-t duhet të fikë audion
            document.getElementById('close-sheet-btn').addEventListener('click', () => {
                if (window.currentDuaAudio) {
                    window.currentDuaAudio.pause();
                    window.currentDuaAudio = null;
                }
                document.getElementById('global-overlay').click();
            });
        });
    },

    initAudioLogic() {
        const btn = document.getElementById('audio-btn');
        const icon = document.getElementById('audio-icon');
        const text = document.getElementById('audio-text');
        if (!btn) return;

        const src = btn.getAttribute('data-audio-src');
        if (!src) return;

        let isPlaying = false;

        btn.addEventListener('click', () => {
            if (!isPlaying) {
                // Ndez audion
                if (!window.currentDuaAudio) {
                    window.currentDuaAudio = new Audio(src);
                    
                    // Kur të mbarojë audio, ktheje butonin siç ishte
                    window.currentDuaAudio.addEventListener('ended', () => {
                        isPlaying = false;
                        text.innerText = 'Dëgjo Audion';
                        icon.setAttribute('data-lucide', 'play');
                        if (window.lucide) window.lucide.createIcons();
                    });
                }
                window.currentDuaAudio.play();
                isPlaying = true;
                text.innerText = 'Ndalo Audion';
                icon.setAttribute('data-lucide', 'pause');
            } else {
                // Ndalon audion
                if (window.currentDuaAudio) {
                    window.currentDuaAudio.pause();
                }
                isPlaying = false;
                text.innerText = 'Dëgjo Audion';
                icon.setAttribute('data-lucide', 'play');
            }
            if (window.lucide) window.lucide.createIcons();
        });
    },

    initBookmarkLogic(duaId, categoryId) {
        const btn = document.getElementById('bookmark-btn');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const isNowFav = this.toggleFavorite(duaId, categoryId);
            
            // Ndryshojmë pamjen e butonit me animacion të vogël
            if (isNowFav) {
                btn.style.color = 'var(--color-accent-teal)';
                btn.innerHTML = `<i data-lucide="bookmark" style="width: 16px; fill: currentColor;"></i>`;
            } else {
                btn.style.color = 'var(--color-text-secondary)';
                btn.innerHTML = `<i data-lucide="bookmark" style="width: 16px;"></i>`;
            }
            if (window.lucide) window.lucide.createIcons();

            // Ringarkojmë listën e favoriteve mbrapa skenës që kur të kthehemi të jetë gati
            this.renderFavorites();
        });
    },

    initCounterLogic(categoryDuas, currentIndex, categoryId) {
        const btn = document.getElementById('counter-btn');
        const display = document.getElementById('counter-display');
        const title = document.getElementById('counter-title');
        if (!btn || !display) return;

        let currentCount = 0;
        const max = parseInt(btn.getAttribute('data-max'));

        btn.addEventListener('click', () => {
            if (currentCount < max) {
                currentCount++;
                display.innerText = `Përsërit: ${currentCount} / ${max}`;
                
                if (navigator.vibrate) navigator.vibrate(50);

                if (currentCount === max) {
                    btn.style.background = '#10B981'; 
                    title.innerText = 'U krye! ✓';
                    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

                    if (currentIndex + 1 < categoryDuas.length) {
                        setTimeout(() => {
                            this.openDuaBottomSheet(categoryDuas, currentIndex + 1, categoryId);
                        }, 1000);
                    } else {
                        setTimeout(() => {
                            title.innerText = 'Kategoria përfundoi!';
                            document.getElementById('global-overlay').click(); 
                        }, 1200);
                    }
                }
            }
        });
    },

    async bindSearch() {
        // ... (Kodi i kërkimit mbetet i njëjtë, s'ka nevojë për ndryshime këtu)
        const searchInput = document.getElementById('dua-search');
        if (!searchInput) return;

        const data = await this.loadData();
        if (!data) return;

        const resultsDiv = document.createElement('div');
        resultsDiv.style.cssText = 'position: absolute; top: 100%; left: 0; right: 0; background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md); margin-top: 8px; z-index: 100; max-height: 300px; overflow-y: auto; display: none; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5);';
        searchInput.parentElement.appendChild(resultsDiv);

        const allDuas = data.categories.flatMap(cat => cat.duas.map(dua => ({...dua, categoryId: cat.id})));

        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            if (term.length < 2) {
                resultsDiv.style.display = 'none';
                return;
            }

            const filtered = allDuas.filter(dua => 
                dua.title.toLowerCase().includes(term) || 
                dua.translation.toLowerCase().includes(term)
            );

            if (filtered.length > 0) {
                resultsDiv.innerHTML = filtered.map(dua => `
                    <div class="search-result-item" data-id="${dua.id}" data-cat="${dua.categoryId}" style="padding: 12px; border-bottom: 1px solid var(--color-border); cursor: pointer;">
                        <div style="font-weight: 600; font-size: 14px; color: var(--color-text-primary);">${dua.title}</div>
                        <div style="font-size: 12px; color: var(--color-text-tertiary);" class="line-clamp-1">${dua.translation}</div>
                    </div>
                `).join('');
                resultsDiv.style.display = 'block';

                resultsDiv.querySelectorAll('.search-result-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const catId = item.getAttribute('data-cat');
                        const duaId = item.getAttribute('data-id');
                        const cat = data.categories.find(c => c.id == catId);
                        const duaIndex = cat.duas.findIndex(d => d.id == duaId);
                        
                        resultsDiv.style.display = 'none';
                        searchInput.value = '';
                        this.openDuaBottomSheet(cat.duas, duaIndex, catId);
                    });
                });
            } else {
                resultsDiv.innerHTML = '<div style="padding: 12px; font-size: 13px; color: var(--color-text-tertiary); text-align: center;">Nuk u gjet asnjë lutje.</div>';
                resultsDiv.style.display = 'block';
            }
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.parentElement.contains(e.target)) {
                resultsDiv.style.display = 'none';
            }
        });
    }
};
