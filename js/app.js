/**
 * Hayat — Application Entry Point
 *
 * Boots the application shell, initializes all foundation modules,
 * and manages route rendering through dynamic imports.
 *
 * Imports approved modules only. No globals, no side effects beyond boot.
 *
 * @module app
 */

import { APP, ROUTES, PRIMARY_ROUTES } from './config.js';
import { on, emit, EVENTS } from './events.js';
import { getState, get, set, subscribe, subscribeTo } from './store.js';
import {
  loadSettings,
  saveSettings,
  patchSettings,
  resetSettings
} from './storage/settings-storage.js';
import { initRouter, navigate } from './router.js';

// ====================================================================
// PAGE MODULE LOADERS (immutable map, no dynamic path construction)
// ====================================================================

var PAGE_LOADERS = Object.freeze({
  home: function () { return import('../pages/home.js'); },
  prayer: function () { return import('../pages/prayer.js'); },
  prayerDhikr: function () { return import('../pages/prayer-dhikr.js'); },
  quran: function () { return import('../pages/quran.js'); },
  dhikr: function () { return import('../pages/dhikr.js'); },
  more: function () { return import('../pages/more.js'); },
  settings: function () { return import('../pages/settings.js'); }
});

// ====================================================================
// DOM REFERENCES
// ====================================================================

var dom = {
  /** @type {HTMLElement} */
  appRoot: null,
  /** @type {HTMLElement} */
  view: null,
  /** @type {HTMLElement} */
  offlineBanner: null,
  /** @type {HTMLUListElement} */
  bottomNavList: null,
  installPrompt: null
};

/** @type {Function|null} Cleanup function from the current page's mount() */
var currentPageCleanup = null;

/** @type {Function|null} Router cleanup function */
var routerCleanup = null;

/** @type {number} Guards against stale dynamic page imports. */
var pageRenderToken = 0;

/** @type {Array<Function>} Store subscription unsubscribes */
var storeUnsubscribes = [];

// ====================================================================
// APP CONTEXT (passed to page render/mount)
// ====================================================================

var appContext = Object.freeze({
  store: {
    getState: getState,
    get: get,
    set: set,
    subscribe: subscribe,
    subscribeTo: subscribeTo
  },
  events: {
    on: on,
    emit: emit,
    EVENTS: EVENTS
  },
  config: {
    APP: APP,
    ROUTES: ROUTES,
    PRIMARY_ROUTES: PRIMARY_ROUTES
  },
  settingsStorage: {
    load: loadSettings,
    save: saveSettings,
    patch: patchSettings,
    reset: resetSettings,
    patchSettings: patchSettings
  },
  navigate: navigate
});

// ====================================================================
// ICON HELPER
// ====================================================================

function createIcon(name, sizeClass) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  var cls = 'icon';
  if (sizeClass) cls += ' ' + sizeClass;
  svg.setAttribute('class', cls);
  svg.setAttribute('aria-hidden', 'true');

  var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', '#icon-' + name);
  svg.appendChild(use);
  return svg;
}

// ====================================================================
// LOADING AND ERROR STATES
// ====================================================================

/**
 * Show an accessible loading state in the route view.
 */
function showLoading() {
  var loading = document.createElement('div');
  loading.className = 'app__loading';
  loading.setAttribute('role', 'status');

  var spinner = document.createElement('div');
  spinner.className = 'app__loading-spinner';
  spinner.setAttribute('aria-hidden', 'true');

  var text = document.createElement('p');
  text.className = 'app__loading-text';
  text.textContent = 'Duke u ngarkuar...';

  var srText = document.createElement('span');
  srText.className = 'sr-only';
  srText.textContent = 'Faqja po ngarkohet';

  loading.appendChild(spinner);
  loading.appendChild(text);
  loading.appendChild(srText);

  dom.view.replaceChildren(loading);
}

/**
 * Show an accessible error state with a Retry button.
 *
 * @param {Error} error - The error that occurred.
 * @param {string} routeId - The route that failed.
 */
function showError(error, routeId) {
  var errorEl = document.createElement('div');
  errorEl.className = 'app__error';
  errorEl.setAttribute('role', 'alert');

  var icon = createIcon('alert-circle', 'icon--2xl');
  icon.classList.add('app__error-icon');

  var title = document.createElement('p');
  title.className = 'app__error-title';
  title.textContent = 'Ndodhi një gabim';

  var message = document.createElement('p');
  message.className = 'app__error-message';
  message.textContent = 'Faqja nuk u ngarkua dot. Provoni përsëri.';

  var retryBtn = document.createElement('button');
  retryBtn.type = 'button';
  retryBtn.className = 'btn btn--primary';
  retryBtn.textContent = 'Provo përsëri';
  retryBtn.addEventListener('click', function () {
    navigate(routeId, { force: true });
  });

  errorEl.appendChild(icon);
  errorEl.appendChild(title);
  errorEl.appendChild(message);
  errorEl.appendChild(retryBtn);

  dom.view.replaceChildren(errorEl);

  // Emit error event
  emit(EVENTS.ERROR, {
    source: 'app-render',
    error: error,
    routeId: routeId
  });
}

// ====================================================================
// BOTTOM NAVIGATION
// ====================================================================

/**
 * Build the bottom navigation from PRIMARY_ROUTES.
 */
function buildBottomNav() {
  if (!dom.bottomNavList) return;

  // Clear existing content
  dom.bottomNavList.replaceChildren();

  PRIMARY_ROUTES.forEach(function (route) {
    var li = document.createElement('li');
    li.className = 'bottom-nav__item';

    var link = document.createElement('a');
    link.href = route.hash;
    link.className = 'bottom-nav__link';
    link.setAttribute('data-route-id', route.id);

    var iconWrap = document.createElement('span');
    iconWrap.className = 'bottom-nav__icon';
    iconWrap.appendChild(createIcon(getIconForRoute(route.id)));

    var label = document.createElement('span');
    label.className = 'bottom-nav__label';
    label.textContent = route.label;

    link.appendChild(iconWrap);
    link.appendChild(label);
    li.appendChild(link);
    dom.bottomNavList.appendChild(li);
  });
}

/**
 * Get the icon name for a route.
 *
 * @param {string} routeId - The route identifier.
 * @returns {string} The icon name.
 */
function getIconForRoute(routeId) {
  var iconMap = {
    home: 'home',
    prayer: 'mosque',
    quran: 'book-open',
    dhikr: 'sparkles',
    more: 'more'
  };
  return iconMap[routeId] || 'home';
}

/**
 * Update the bottom navigation active state.
 *
 * @param {string} routeId - The current route identifier.
 */
function updateBottomNav(routeId) {
  if (!dom.bottomNavList) return;

  var activePrimaryRoute = routeId === 'settings'
    ? 'more'
    : (routeId === 'prayerDhikr' ? 'prayer' : routeId);

  var links = dom.bottomNavList.querySelectorAll('.bottom-nav__link');
  links.forEach(function (link) {
    var linkRouteId = link.getAttribute('data-route-id');
    if (linkRouteId === activePrimaryRoute) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

// ====================================================================
// ONLINE/OFFLINE
// ====================================================================

/**
 * Update the offline banner visibility.
 *
 * @param {boolean} isOnline - Whether the app is online.
 */
function updateOfflineBanner(isOnline) {
  if (!dom.offlineBanner) return;

  if (isOnline) {
    dom.offlineBanner.setAttribute('hidden', '');
    dom.appRoot.classList.remove('app--offline');
  } else {
    dom.offlineBanner.removeAttribute('hidden');
    dom.appRoot.classList.add('app--offline');
  }
}

/**
 * Set up online/offline event listeners.
 */
function initOnlineOffline() {
  var handleOnline = function () {
    set('app.online', true);
    updateOfflineBanner(true);
    emit(EVENTS.ONLINE_CHANGED, { online: true });
  };

  var handleOffline = function () {
    set('app.online', false);
    updateOfflineBanner(false);
    emit(EVENTS.ONLINE_CHANGED, { online: false });
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup
  return function () {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// ====================================================================
// THEME
// ====================================================================

/**
 * Apply the theme from settings to the document.
 *
 * @param {string} theme - The theme to apply.
 */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

/**
 * Subscribe to theme changes and update the document.
 */
function initThemeSync() {
  var unsub = subscribeTo('settings.theme', function (nextTheme) {
    applyTheme(nextTheme);
  });
  storeUnsubscribes.push(unsub);
}

// ====================================================================
// ROUTE RENDERING
// ====================================================================

/**
 * The router's onRoute callback. Dynamically imports and renders the page module.
 *
 * @param {Object} context - Route context from the router.
 * @returns {Promise<void>}
 */
async function onRoute(context) {
  var renderToken = ++pageRenderToken;
  var routeId = context.id;

  // Clean up previous page
  if (typeof currentPageCleanup === 'function') {
    try {
      currentPageCleanup();
    } catch (err) {
      console.error('[Hayat] Page cleanup error:', err);
    }
    currentPageCleanup = null;
  }

  // Show loading
  showLoading();

  // Find the loader
  var loader = PAGE_LOADERS[routeId];
  if (!loader) {
    showError(new Error('Route not found: ' + routeId), routeId);
    return;
  }

  try {
    // Dynamic import
    var pageModule = await loader();

    // A newer route started while this module was loading.
    if (renderToken !== pageRenderToken) return;

    // Verify render export
    if (typeof pageModule.render !== 'function') {
      throw new Error('Page module missing render() export: ' + routeId);
    }

    // Call render
    var pageElement = pageModule.render(context, appContext);

    // Verify result is an HTMLElement
    if (!(pageElement instanceof HTMLElement)) {
      throw new Error('Page render() must return an HTMLElement: ' + routeId);
    }

    // Replace view content
    dom.view.replaceChildren(pageElement);

    // Call optional mount
    if (typeof pageModule.mount === 'function') {
      currentPageCleanup = pageModule.mount(pageElement, context, appContext);
    }

    // Update store
    set('route.current', {
      id: context.id,
      hash: context.hash,
      label: context.label
    });
    set('route.previous', context.previous);
    set('route.params', context.params);

    // Update bottom nav
    updateBottomNav(routeId);

  } catch (err) {
    console.error('[Hayat] Route render error:', err);
    showError(err, routeId);
  }
}

// ====================================================================
// BOOT
// ====================================================================

/**
 * Boot the application.
 */
function boot() {
  // 1. Find required DOM nodes
  dom.appRoot = document.querySelector('.app');
  dom.view = document.getElementById('app-view');
  dom.offlineBanner = document.getElementById('app-offline');
  dom.bottomNavList = document.getElementById('app-bottom-nav');
  dom.installPrompt = document.querySelector('[data-app-install]');

  if (!dom.appRoot || !dom.view) {
    throw new Error('[Hayat] Required DOM nodes not found (.app, #app-view)');
  }

  // 2. Load validated settings
  var settings = loadSettings();

  // 3. Apply theme before first render
  applyTheme(settings.theme);

  // 4. Populate store
  set('settings', settings);
  set('app.online', typeof navigator !== 'undefined' ? navigator.onLine : true);

  // 5. Initialize online/offline
  var onlineCleanup = initOnlineOffline();
  updateOfflineBanner(getState().app.online);

  // 6. Build bottom navigation
  buildBottomNav();

  // 7. Initialize theme sync
  initThemeSync();

  // 8. Initialize router
  routerCleanup = initRouter({
    onRoute: onRoute,
    scrollContainer: dom.view,
    documentTitlePrefix: APP.name
  });

  // 9. Mark app as ready
  set('app.ready', true);
  emit(EVENTS.APP_READY, { version: APP.version });
  registerServiceWorker();
  initInstallPrompt();

  // 10. Register pagehide cleanup
  window.addEventListener('pagehide', function () {
    cleanup(onlineCleanup);
  });
}

/**
 * Clean up all resources.
 *
 * @param {Function} onlineCleanup - Online/offline listener cleanup.
 */
function cleanup(onlineCleanup) {
  // Invalidate any route import still in flight.
  pageRenderToken += 1;

  // Clean up current page
  if (typeof currentPageCleanup === 'function') {
    try {
      currentPageCleanup();
    } catch (err) {
      console.error('[Hayat] Final page cleanup error:', err);
    }
    currentPageCleanup = null;
  }

  // Clean up router
  if (typeof routerCleanup === 'function') {
    routerCleanup();
    routerCleanup = null;
  }

  // Clean up online/offline
  if (typeof onlineCleanup === 'function') {
    onlineCleanup();
  }

  // Clean up store subscriptions
  storeUnsubscribes.forEach(function (unsub) {
    try {
      unsub();
    } catch (err) {
      console.error('[Hayat] Store unsubscribe error:', err);
    }
  });
  storeUnsubscribes.length = 0;
}

function initInstallPrompt() {
  if (!dom.installPrompt || !('serviceWorker' in navigator)) return;
  var deferredPrompt = null;
  var accept = dom.installPrompt.querySelector('[data-app-install-accept]');
  var dismiss = dom.installPrompt.querySelector('[data-app-install-dismiss]');
  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    deferredPrompt = event;
    dom.installPrompt.hidden = false;
  });
  window.addEventListener('appinstalled', function () {
    deferredPrompt = null;
    dom.installPrompt.hidden = true;
  });
  if (accept) accept.addEventListener('click', function () {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.finally(function () {
      deferredPrompt = null;
      dom.installPrompt.hidden = true;
    });
  });
  if (dismiss) dismiss.addEventListener('click', function () {
    dom.installPrompt.hidden = true;
  });
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./service-worker.js').catch(function () {
      /* Offline support remains unavailable when registration fails. */
    });
  }, { once: true });
}

// ====================================================================
// START
// ====================================================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
