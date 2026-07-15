/**
 * Hayat — Application Configuration
 *
 * Immutable configuration for the Hayat application.
 * This module imports nothing and has no side effects.
 *
 * @module config
 */

// ====================================================================
// UTILITIES
// ====================================================================

/**
 * Recursively freeze an object and all nested objects/arrays.
 * Returns the same reference, now deeply frozen.
 *
 * @param {Object} obj - The object to freeze.
 * @returns {Object} The frozen object.
 */
function deepFreeze(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  Object.freeze(obj);
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    var value = obj[keys[i]];
    if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  }
  return obj;
}

// ====================================================================
// APP METADATA
// ====================================================================

var APP = deepFreeze({
  name: 'Hayat',
  locale: 'sq-AL',
  defaultTheme: 'dark',
  supportedThemes: ['dark', 'light'],
  version: '0.1.0'
});

// ====================================================================
// ROUTES
// ====================================================================

var ROUTES = deepFreeze([
  {
    id: 'home',
    hash: '#/home',
    label: 'Kryefaqja',
    primary: true
  },
  {
    id: 'prayer',
    hash: '#/prayer',
    label: 'Namazi',
    primary: true
  },
  {
    id: 'quran',
    hash: '#/quran',
    label: "Kur'ani",
    primary: true
  },
  {
    id: 'dhikr',
    hash: '#/dhikr',
    label: 'Dhikri',
    primary: true
  },
  {
    id: 'more',
    hash: '#/more',
    label: 'Më shumë',
    primary: true
  },
  {
    id: 'settings',
    hash: '#/settings',
    label: 'Cilësimet',
    primary: false
  }
]);

/**
 * Primary navigation routes — exactly five, matching the bottom nav.
 */
var PRIMARY_ROUTES = deepFreeze(ROUTES.filter(function (r) { return r.primary; }));

// ====================================================================
// STORAGE KEYS
// ====================================================================

var STORAGE_KEYS = deepFreeze({
  settings: 'hayat-settings',
  schemaVersion: 'hayat-schema-version'
});

// ====================================================================
// DEFAULT SETTINGS
// ====================================================================

var DEFAULT_SETTINGS = deepFreeze({
  schemaVersion: 1,
  theme: 'dark',
  locale: 'sq-AL',
  city: 'Tiranë',
  country: 'Shqipëri',
  coordinates: null,
  hijriAdjustment: 0,
  enabledModules: ['prayer', 'quran', 'dhikr', 'mburoja', 'dayPlanner', 'settings'],
  homeCards: ['prayer', 'now', 'quran', 'dhikr'],
  hayatAIEnabled: false,
  reducedMotionOverride: 'system'
});

/**
 * Allowlists used by settings validation.
 * Exported for use by settings-storage.js.
 */
var ALLOWED_MODULES = deepFreeze([
  'prayer',
  'quran',
  'dhikr',
  'mburoja',
  'dayPlanner',
  'settings'
]);

var ALLOWED_HOME_CARDS = deepFreeze([
  'prayer',
  'now',
  'quran',
  'dhikr'
]);

var ALLOWED_REDUCED_MOTION = deepFreeze([
  'system',
  'reduce',
  'no-preference'
]);

// ====================================================================
// HELPER FUNCTIONS
// ====================================================================

/**
 * Find a route definition by its id.
 *
 * @param {string} id - The route identifier (e.g. 'home').
 * @returns {Object|null} The route definition or null.
 */
export function getRouteById(id) {
  if (typeof id !== 'string') return null;
  for (var i = 0; i < ROUTES.length; i++) {
    if (ROUTES[i].id === id) return ROUTES[i];
  }
  return null;
}

/**
 * Find a route definition by its hash (e.g. '#/home').
 * Only matches the path portion, ignoring query parameters.
 *
 * @param {string} hash - The URL hash string.
 * @returns {Object|null} The route definition or null.
 */
export function getRouteByHash(hash) {
  if (typeof hash !== 'string') return null;
  var pathOnly = hash.split('?')[0];
  for (var i = 0; i < ROUTES.length; i++) {
    if (ROUTES[i].hash === pathOnly) return ROUTES[i];
  }
  return null;
}

/**
 * Check whether a given string is a supported theme.
 *
 * @param {string} theme - The theme name to check.
 * @returns {boolean} True if the theme is supported.
 */
export function isValidTheme(theme) {
  return APP.supportedThemes.indexOf(theme) !== -1;
}

// ====================================================================
// EXPORTS
// ====================================================================

export {
  deepFreeze,
  APP,
  ROUTES,
  PRIMARY_ROUTES,
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  ALLOWED_MODULES,
  ALLOWED_HOME_CARDS,
  ALLOWED_REDUCED_MOTION
};
