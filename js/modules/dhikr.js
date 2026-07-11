/**
 * Dhikr Module (dhikr.js)
 * Kontrollon SPA-në e brendshme: Hub, Player, dhe Free Counter.
 */

import { Storage } from '../core/storage.js';

class DhikrModule {
  constructor() {
    this.adhkarData = { morning: [], evening: [], sleep: [] };
    this.currentPlaylist = [];
    this.currentIndex = 0;
    this.currentDuaCount = 0;
    
    // Free counter state
    this.freeCount = 0;
    this.freeTarget = 33;
    
    // Stats
    this.stats = {
      todayCount: 0,
      lastDate: null,
      streak: 0
    };

    document.addEventListener('pageLoaded', (e) => {
      if (e.detail.path === '/dhikr') {
        this.mount();
      }
    });
  }

  async mount() {
    console.log('[Dhikr] Moduli u ngarkua.');
    this.cacheDOM();
    this.loadStats();
    this.updateSuggestionCard();
    this.bindGlobalEvents();
    
    await this.fetchData();
    
    // Default to Home View
    this.switchView('home');
    if (window.lucide) window.lucide.createIcons();
  }

  cacheDOM() {
    // Views
    this.viewHome = document.getElementById('dhikr-view-home');
    this.viewPlayer = document.getElementById('dhikr-view-player');
    this.viewFree = document.getElementById('dhikr-view-free');
    
    // Home Elements
    this.statCountEl = document.getElementById('stat-today-count');
    this.statStreakEl = document.getElementById('stat-streak');
    this.suggestionCard = document.getElementById('dhikr-suggestion-card');
    this.navBtns = document.querySelectorAll('.dhikr-nav-btn');
    
    // Player Elements
    this.pTitle = document.getElementById('player-title');
    this.pProgressText = document.getElementById('player-progress-text');
    this.pProgressBar = document.getElementById('player-progress-bar');
    this.pDuaTitle = document.getElementById('player-dua-title');
    this.pTargetText = document.getElementById('player-target-text');
    this.pArabic = document.getElementById('player-arabic');
    this.pTransl = document.getElementById('player-transliteration');
    this.pTrans = document.getElementById('player-translation');
    this.pSource = document.getElementById('player-source');
    this.pVirtue = document.getElementById('player-virtue');
    this.pCount = document.getElementById('player-count');
    
    this.btnPTap = document.getElementById('btn-player-tap');
    this.btnPNext = document.getElementById('btn-player-next');
    this.btnPPrev = document.getElementById('btn-player-prev');
    this.btnCloses = document.querySelectorAll('.btn-close-player');

    // Free Elements
    this.btnFTap = document.getElementById('btn-tap-free');
    this.fCount = document.getElementById('free-count');
    this.btnFReset = document.getElementById('btn-reset-free');
    this.fTargetBtns = document.querySelectorAll('#dhikr-view-free .segmented__btn');
  }

  async fetchData() {
    try {
      const response = await fetch('data/adhkar.json');
      if (response.ok) {
        this.adhkarData = await response.json();
      }
    } catch (e) {
      console.error('[Dhikr] Gabim në ngarkimin e json:', e);
    }
  }

  // --- STATE & UI MANAGEMENT ---

  loadStats() {
    const today = new Date().toDateString();
    this.stats = Storage.get('dhikr_stats', { todayCount: 0, lastDate: null, streak: 0 });
    
    if (this.stats.lastDate !== today) {
      // Logic for streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (this.stats.lastDate === yesterday.toDateString()) {
        // Kept streak
      } else {
        this.stats.streak = 0; // Broken streak
      }
      
      this.stats.todayCount = 0;
      this.stats.lastDate = today;
      this.saveStats();
    }

    this.statCountEl.textContent = this.stats.todayCount;
    this.statStreakEl.textContent = `🔥 ${this.stats.streak} ditë radhazi`;
  }

  saveStats() {
    Storage.set('dhikr_stats', this.stats);
    if (this.statCountEl) this.statCountEl.textContent = this.stats.todayCount;
  }

  incrementGlobalCount(amount = 1) {
    this.stats.todayCount += amount;
    
    // Award a streak if they did at least 10 dhikr today and streak hasn't updated
    if (this.stats.todayCount === 10 && this.stats.streak === 0) {
       this.stats.streak += 1;
       this.statStreakEl.textContent = `🔥 ${this.stats.streak} ditë radhazi`;
    }
    this.saveStats();
  }

  switchView(viewName) {
    this.viewHome.style.display = 'none';
    this.viewPlayer.style.display = 'none';
    this.viewFree.style.display = 'none';

    if (viewName === 'home') this.viewHome.style.display = 'block';
    if (viewName === 'player') {
      this.viewPlayer.style.display = 'flex';
      // Hide main app nav bar when in player
      document.getElementById('main-nav').style.display = 'none';
    }
    if (viewName === 'free') {
      this.viewFree.style.display = 'flex';
      document.getElementById('main-nav').style.display = 'none';
    }

    if (viewName === 'home') {
      document.getElementById('main-nav').style.display = 'flex';
      this.updateSuggestionCard();
    }
  }

  updateSuggestionCard() {
    const hour = new Date().getHours();
    let type = '';
    let title = '';
    let btnText = '';

    if (hour >= 4 && hour < 10) {
      type = 'morning'; title = "Është koha për Dhikrin e Mëngjesit"; btnText = "Fillo Mëngjesin";
    } else if (hour >= 15 && hour < 20) {
      type = 'evening'; title = "Është koha për Dhikrin e Mbrëmjes"; btnText = "Fillo Mbrëmjen";
    } else {
      type = 'sleep'; title = "Mos harro Dhikrin para Gjumit"; btnText = "Fillo para Gjumit";
    }

    this.suggestionCard.innerHTML = `
      <h3 style="font-size: var(--font-size-lg); color: #fff; margin-bottom: var(--space-4);">${title}</h3>
      <button class="btn btn--primary dhikr-nav-btn" data-type="${type}" style="width: 100%; box-shadow: none;">${btnText}</button>
    `;
    
    // Rebind dynamic button
    this.suggestionCard.querySelector('button').addEventListener('click', (e) => {
      this.startGuidedPlaylist(e.currentTarget.dataset.type);
    });
  }

  bindGlobalEvents() {
    // Navigation cards
    this.navBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.currentTarget.dataset.type;
        if (type === 'free') {
          this.switchView('free');
        } else {
          this.startGuidedPlaylist(type);
        }
      });
    });

    // Close buttons
    this.btnCloses.forEach(btn => {
      btn.addEventListener('click', () => this.switchView('home'));
    });

    // --- PLAYER EVENTS ---
    this.btnPTap.addEventListener('click', () => this.handlePlayerTap());
    this.btnPNext.addEventListener('click', () => this.navigatePlayer(1));
    this.btnPPrev.addEventListener('click', () => this.navigatePlayer(-1));
    
    // Haptic UI effect
    this.btnPTap.addEventListener('touchstart', () => { this.btnPTap.style.transform = 'scale(0.95)'; }, { passive: true });
    this.btnPTap.addEventListener('touchend', () => { this.btnPTap.style.transform = 'scale(1)'; }, { passive: true });

    // --- FREE COUNTER EVENTS ---
    this.btnFTap.addEventListener('click', () => this.handleFreeTap());
    this.btnFReset.addEventListener('click', () => {
      this.freeCount = 0;
      this.fCount.textContent = 0;
      this.vibrate(50);
    });
    
    this.btnFTap.addEventListener('touchstart', () => { this.btnFTap.style.transform = 'scale(0.95)'; }, { passive: true });
    this.btnFTap.addEventListener('touchend', () => { this.btnFTap.style.transform = 'scale(1)'; }, { passive: true });

    this.fTargetBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.fTargetBtns.forEach(b => b.classList.remove('is-active'));
        e.target.classList.add('is-active');
        const t = e.target.getAttribute('data-target');
        this.freeTarget = t === 'infinity' ? Infinity : parseInt(t, 10);
      });
    });
  }

  // --- GUIDED PLAYER LOGIC ---

  startGuidedPlaylist(type) {
    if (!this.adhkarData[type] || this.adhkarData[type].length === 0) {
      alert("Të dhënat po ngarkohen. Ju lutem provoni përsëri.");
      return;
    }

    const titles = {
      morning: 'Dhikri i Mëngjesit',
      evening: 'Dhikri i Mbrëmjes',
      sleep: 'Para Fjetjes'
    };

    this.pTitle.textContent = titles[type];
    this.currentPlaylist = this.adhkarData[type];
    this.currentIndex = 0;
    this.currentDuaCount = 0;
    
    this.renderCurrentDua();
    this.switchView('player');
  }

  renderCurrentDua() {
    const dua = this.currentPlaylist[this.currentIndex];
    this.currentDuaCount = 0;

    this.pProgressText.textContent = `${this.currentIndex + 1}/${this.currentPlaylist.length}`;
    this.pProgressBar.style.width = `${((this.currentIndex + 1) / this.currentPlaylist.length) * 100}%`;
    
    this.pDuaTitle.textContent = dua.title;
    this.pTargetText.textContent = `${dua.target} herë`;
    
    this.pArabic.textContent = dua.arabic;
    this.pTransl.textContent = dua.transliteration;
    this.pTrans.textContent = dua.translation;
    this.pSource.textContent = dua.source;
    this.pVirtue.textContent = dua.virtue;
    
    this.pCount.textContent = '0';
    this.updatePlayerButtons();
  }

  handlePlayerTap() {
    const dua = this.currentPlaylist[this.currentIndex];
    if (this.currentDuaCount < dua.target) {
      this.currentDuaCount++;
      this.incrementGlobalCount(1);
      this.pCount.textContent = this.currentDuaCount;
      
      if (this.currentDuaCount === dua.target) {
        this.vibrate([100, 50, 100]); // Target reached haptic
        this.btnPTap.style.borderColor = 'var(--color-success)';
        
        // Auto-advance
        setTimeout(() => {
          this.btnPTap.style.borderColor = 'var(--color-accent-gold)';
          this.navigatePlayer(1);
        }, 600);
      } else {
        this.vibrate(15); // Light tap haptic
      }
    }
  }

  navigatePlayer(dir) {
    const newIndex = this.currentIndex + dir;
    if (newIndex >= 0 && newIndex < this.currentPlaylist.length) {
      this.currentIndex = newIndex;
      this.renderCurrentDua();
    } else if (newIndex >= this.currentPlaylist.length) {
      // Completed playlist
      alert(`Ma sha Allah! Përfundove ${this.pTitle.textContent}. Zoti ta pranoftë!`);
      this.switchView('home');
    }
  }

  updatePlayerButtons() {
    this.btnPPrev.style.opacity = this.currentIndex === 0 ? '0.3' : '1';
    this.btnPPrev.style.pointerEvents = this.currentIndex === 0 ? 'none' : 'auto';
  }

  // --- FREE COUNTER LOGIC ---

  handleFreeTap() {
    this.freeCount++;
    this.incrementGlobalCount(1);
    this.fCount.textContent = this.freeCount;

    if (this.freeCount === this.freeTarget) {
      this.vibrate([100, 50, 100]);
      this.freeCount = 0; // Auto reset
      setTimeout(() => { this.fCount.textContent = '0'; }, 500);
    } else {
      this.vibrate(15);
    }
  }

  // --- UTILS ---
  vibrate(pattern) {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }
}

export const dhikrModule = new DhikrModule();
