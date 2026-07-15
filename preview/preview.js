/**
 * Hayat Design System Preview — Interactive Controller
 * Development-only script. Not for production use.
 * No external dependencies.
 */
(function () {
  'use strict';

  // ====================================================================
  // CONSTANTS
  // ====================================================================

  var VALID_THEMES = ['dark', 'light'];
  var VALID_READER_THEMES = ['paper', 'sepia', 'night'];
  var VALID_WIDTHS = ['320', '390', '430', '768'];
  var VALID_SCREENS = ['home', 'namaz', 'quran', 'reader', 'dhikr', 'mburoja', 'day', 'settings'];

  var STORAGE_THEME = 'hayat-preview-theme';
  var STORAGE_READER = 'hayat-preview-reader-theme';
  var STORAGE_WIDTH = 'hayat-preview-width';
  var STORAGE_SCREEN = 'hayat-preview-screen';

  var DEFAULT_THEME = 'dark';
  var DEFAULT_READER = 'paper';
  var DEFAULT_WIDTH = '390';
  var DEFAULT_SCREEN = 'home';

  // ====================================================================
  // UTILITIES
  // ====================================================================

  function safeGetStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function safeSetStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Silently fail if storage is unavailable
    }
  }

  function validateChoice(value, allowlist) {
    return allowlist.indexOf(value) !== -1 ? value : null;
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function getFocusableElements(container) {
    if (!container) return [];
    var selectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');
    return Array.prototype.slice.call(container.querySelectorAll(selectors));
  }

  // ====================================================================
  // APP THEME
  // ====================================================================

  function setAppTheme(theme) {
    var valid = validateChoice(theme, VALID_THEMES) || DEFAULT_THEME;
    document.documentElement.dataset.theme = valid;

    var buttons = document.querySelectorAll('[data-theme-choice]');
    buttons.forEach(function (btn) {
      var isActive = btn.dataset.themeChoice === valid;
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      btn.dataset.active = isActive ? 'true' : 'false';
    });

    safeSetStorage(STORAGE_THEME, valid);
  }

  function initAppTheme() {
    var saved = validateChoice(safeGetStorage(STORAGE_THEME), VALID_THEMES);
    setAppTheme(saved || DEFAULT_THEME);

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-theme-choice]');
      if (btn) {
        setAppTheme(btn.dataset.themeChoice);
      }
    });
  }

  // ====================================================================
  // READER THEME
  // ====================================================================

  function setReaderTheme(theme) {
    var valid = validateChoice(theme, VALID_READER_THEMES) || DEFAULT_READER;

    var readers = document.querySelectorAll('.reader');
    readers.forEach(function (reader) {
      reader.dataset.readerTheme = valid;
    });

    var buttons = document.querySelectorAll('[data-reader-theme-choice]');
    buttons.forEach(function (btn) {
      var isActive = btn.dataset.readerThemeChoice === valid;
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      btn.dataset.active = isActive ? 'true' : 'false';

      // Update reader-control--active class only for reader controls inside .reader
      if (btn.classList.contains('reader-control')) {
        if (isActive) {
          btn.classList.add('reader-control--active');
        } else {
          btn.classList.remove('reader-control--active');
        }
      }
    });

    safeSetStorage(STORAGE_READER, valid);
  }

  function initReaderTheme() {
    var saved = validateChoice(safeGetStorage(STORAGE_READER), VALID_READER_THEMES);
    setReaderTheme(saved || DEFAULT_READER);

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-reader-theme-choice]');
      if (btn) {
        setReaderTheme(btn.dataset.readerThemeChoice);
      }
    });
  }

  // ====================================================================
  // VIEWPORT SWITCHING
  // ====================================================================

  function setViewport(width, bringIntoView) {
    var valid = validateChoice(width, VALID_WIDTHS) || DEFAULT_WIDTH;

    var device = document.querySelector('.preview-device');
    if (device) {
      device.dataset.previewWidth = valid;
    }

    var buttons = document.querySelectorAll('[data-viewport-choice]');
    buttons.forEach(function (btn) {
      var isActive = btn.dataset.viewportChoice === valid;
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      btn.dataset.active = isActive ? 'true' : 'false';
    });

    safeSetStorage(STORAGE_WIDTH, valid);

    // Scroll device stage into view (respect reduced motion)
    var stage = document.querySelector('.preview-device-stage');
    if (stage && bringIntoView) {
      var behavior = prefersReducedMotion() ? 'auto' : 'smooth';
      stage.scrollIntoView({ behavior: behavior, block: 'nearest', inline: 'center' });
    }
  }

  function initViewport() {
    var saved = validateChoice(safeGetStorage(STORAGE_WIDTH), VALID_WIDTHS);
    setViewport(saved || DEFAULT_WIDTH, false);

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-viewport-choice]');
      if (btn) {
        setViewport(btn.dataset.viewportChoice, true);
      }
    });
  }

  // ====================================================================
  // SCREEN SWITCHING
  // ====================================================================

  function setScreen(screenName) {
    var valid = validateChoice(screenName, VALID_SCREENS) || DEFAULT_SCREEN;

    var screens = document.querySelectorAll('[data-preview-screen]');
    screens.forEach(function (screen) {
      var isActive = screen.dataset.previewScreen === valid;
      if (isActive) {
        screen.removeAttribute('hidden');
        screen.setAttribute('aria-hidden', 'false');
      } else {
        screen.setAttribute('hidden', '');
        screen.setAttribute('aria-hidden', 'true');
      }
    });

    // Update radio buttons
    var radios = document.querySelectorAll('[data-screen-choice]');
    radios.forEach(function (radio) {
      radio.checked = radio.dataset.screenChoice === valid;
    });

    // Reset scroll position inside device viewport
    var viewport = document.querySelector('.preview-device__viewport');
    if (viewport) {
      viewport.scrollTop = 0;
    }
    var activeScreen = document.querySelector('[data-preview-screen="' + valid + '"]');
    if (activeScreen) {
      var pageScroller = activeScreen.querySelector('.page-shell');
      if (pageScroller) pageScroller.scrollTop = 0;
    }

    safeSetStorage(STORAGE_SCREEN, valid);
  }

  function initScreenSwitching() {
    var saved = validateChoice(safeGetStorage(STORAGE_SCREEN), VALID_SCREENS);
    setScreen(saved || DEFAULT_SCREEN);

    document.addEventListener('change', function (e) {
      if (e.target.matches('[data-screen-choice]')) {
        setScreen(e.target.dataset.screenChoice);
      }
    });
  }

  // ====================================================================
  // MODAL AND BOTTOM SHEET OVERLAYS
  // ====================================================================

  var overlayState = {
    activeBackdrop: null,
    triggerElement: null,
    savedOverflow: '',
    savedPaddingRight: ''
  };

  function openOverlay(targetId) {
    var backdrop = document.getElementById(targetId);
    if (!backdrop) return;

    // Close any currently open overlay first
    if (overlayState.activeBackdrop) {
      closeOverlayImmediate(overlayState.activeBackdrop);
    }

    var dialogChild = backdrop.querySelector('.modal, .bottom-sheet');

    // Prevent body scroll without layout shift
    var scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    overlayState.savedOverflow = document.body.style.overflow;
    overlayState.savedPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = scrollbarWidth + 'px';
    }

    // Save focus trigger
    overlayState.triggerElement = document.activeElement;
    overlayState.activeBackdrop = backdrop;

    // Open
    backdrop.setAttribute('data-state', 'open');
    backdrop.setAttribute('aria-hidden', 'false');
    if (dialogChild) {
      dialogChild.setAttribute('data-state', 'open');
      dialogChild.removeAttribute('aria-hidden');
    }

    // Focus first focusable element inside the dialog
    requestAnimationFrame(function () {
      var focusable = getFocusableElements(dialogChild || backdrop);
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    });
  }

  function closeOverlay(backdrop) {
    if (!backdrop) return;

    var dialogChild = backdrop.querySelector('.modal, .bottom-sheet');
    var reducedMotion = prefersReducedMotion();

    // Set closed state
    backdrop.setAttribute('data-state', 'closed');
    backdrop.setAttribute('aria-hidden', 'true');
    if (dialogChild) {
      dialogChild.setAttribute('data-state', 'closed');
    }

    // Set aria-hidden after transition or immediately under reduced motion
    var markHidden = function () {
      if (dialogChild) {
        dialogChild.setAttribute('aria-hidden', 'true');
      }
    };

    if (reducedMotion) {
      markHidden();
    } else {
      setTimeout(markHidden, 300);
    }

    // Restore body scroll
    document.body.style.overflow = overlayState.savedOverflow;
    document.body.style.paddingRight = overlayState.savedPaddingRight;

    // Restore focus
    if (overlayState.triggerElement && typeof overlayState.triggerElement.focus === 'function') {
      overlayState.triggerElement.focus();
    }

    overlayState.activeBackdrop = null;
    overlayState.triggerElement = null;
  }

  function closeOverlayImmediate(backdrop) {
    if (!backdrop) return;

    var dialogChild = backdrop.querySelector('.modal, .bottom-sheet');
    backdrop.setAttribute('data-state', 'closed');
    backdrop.setAttribute('aria-hidden', 'true');
    if (dialogChild) {
      dialogChild.setAttribute('data-state', 'closed');
      dialogChild.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = overlayState.savedOverflow;
    document.body.style.paddingRight = overlayState.savedPaddingRight;
    overlayState.activeBackdrop = null;
  }

  function trapFocus(e, container) {
    if (e.key !== 'Tab') return;

    var focusable = getFocusableElements(container);
    if (focusable.length === 0) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function initOverlays() {
    // Set initial aria-hidden on all closed overlays
    var allBackdrops = document.querySelectorAll('.modal-backdrop');
    allBackdrops.forEach(function (backdrop) {
      if (backdrop.dataset.state === 'closed') {
        backdrop.setAttribute('aria-hidden', 'true');
        var dialogChild = backdrop.querySelector('.modal, .bottom-sheet');
        if (dialogChild) {
          dialogChild.setAttribute('aria-hidden', 'true');
        }
      }
    });

    // Open triggers
    document.addEventListener('click', function (e) {
      var modalTrigger = e.target.closest('[data-open-modal]');
      if (modalTrigger) {
        e.preventDefault();
        openOverlay(modalTrigger.dataset.openModal);
        return;
      }

      var sheetTrigger = e.target.closest('[data-open-sheet]');
      if (sheetTrigger) {
        e.preventDefault();
        openOverlay(sheetTrigger.dataset.openSheet);
        return;
      }

      // Close button
      var closeBtn = e.target.closest('[data-close-overlay]');
      if (closeBtn && overlayState.activeBackdrop) {
        closeOverlay(overlayState.activeBackdrop);
        return;
      }

      // Click on backdrop (outside the dialog)
      if (overlayState.activeBackdrop && e.target === overlayState.activeBackdrop) {
        closeOverlay(overlayState.activeBackdrop);
      }
    });

    // Escape key closes overlay
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlayState.activeBackdrop) {
        closeOverlay(overlayState.activeBackdrop);
      }

      // Focus trap
      if (overlayState.activeBackdrop) {
        var dialogChild = overlayState.activeBackdrop.querySelector('.modal, .bottom-sheet');
        trapFocus(e, dialogChild || overlayState.activeBackdrop);
      }
    });
  }

  // ====================================================================
  // DEMO LINKS — Prevent jump-to-top for href="#"
  // ====================================================================

  function initDemoLinks() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;

      var href = link.getAttribute('href');

      // Allow skip link and real anchor links
      if (link.classList.contains('skip-link')) return;

      // Allow links that reference a real element ID
      if (href && href.charAt(0) === '#' && href.length > 1) {
        var target = document.getElementById(href.substring(1));
        if (target) return; // Real in-page anchor, let it work naturally
      }

      // Allow non-placeholder URLs
      if (href && href !== '#' && href.charAt(0) !== '#') return;

      // Prevent jump-to-top for bare "#" links
      if (href === '#') {
        e.preventDefault();
      }
    });
  }

  // ====================================================================
  // TOAST DEMO
  // ====================================================================

  function initToastDemo() {
    var toastDemo = document.querySelector('.preview-toast-demo');
    if (!toastDemo) return;

    var closeBtn = toastDemo.querySelector('.toast__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        var toast = closeBtn.closest('.toast');
        if (toast) {
          toast.hidden = true;
        }
      });
    }
  }

  // ====================================================================
  // INITIALIZATION
  // ====================================================================

  function init() {
    initAppTheme();
    initReaderTheme();
    initViewport();
    initScreenSwitching();
    initOverlays();
    initDemoLinks();
    initToastDemo();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
