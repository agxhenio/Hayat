/**
 * Hayat — Application Configuration (v0.2.0)
 *
 * Immutable configuration for the Hayat application.
 * Includes prayer engine constants and helpers.
 *
 * @module config
 */

// ====================================================================
// UTILITIES
// ====================================================================

/**
 * Recursively freeze an object and all nested objects/arrays.
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
  version: '0.4.0'
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
    id: 'prayerDhikr',
    hash: '#/prayer/dhikr',
    label: 'Dhikri pas namazit',
    primary: false
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

var PRIMARY_ROUTES = deepFreeze(ROUTES.filter(function (r) { return r.primary; }));

// ====================================================================
// STORAGE KEYS
// ====================================================================

var STORAGE_KEYS = deepFreeze({
  settings: 'hayat-settings',
  schemaVersion: 'hayat-schema-version',
  prayerCache: 'hayat-prayer-cache'
});

// ====================================================================
// PRAYER CONSTANTS
// ====================================================================

/**
 * The five canonical prayers (sunrise is NOT a prayer).
 */
var PRAYER_KEYS = deepFreeze(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']);

/**
 * All six canonical timing keys including sunrise as a boundary.
 */
var TIMING_KEYS = deepFreeze(['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']);

/**
 * Albanian labels for prayers and sunrise.
 */
var PRAYER_LABELS_SQ = deepFreeze({
  fajr: 'Sabahu',
  sunrise: 'Lindja e diellit',
  dhuhr: 'Dreka',
  asr: 'Ikindia',
  maghrib: 'Akshami',
  isha: 'Jacia'
});

/**
 * Prayer API configuration.
 */
var PRAYER_API = deepFreeze({
  baseUrl: 'https://api.aladhan.com/v1',
  defaultMethod: 3,
  defaultSchool: 1,
  timeoutMs: 10000,
  cacheMaxEntries: 16,
  cacheMaxAgeMs: 45 * 24 * 60 * 60 * 1000
});


/** QuranEnc Arabic/Albanian content configuration. */
var QURAN_CONTENT_API = deepFreeze({
  baseUrl: 'https://quranenc.com/api/v1/translation',
  translationKey: 'albanian_nahi',
  translationNameSq: 'Përkthimi shqip — Hasan Nahi',
  providerName: 'QuranEnc',
  providerUrl: 'https://quranenc.com',
  timeoutMs: 10000,
  cacheMaxAgeMs: 365 * 24 * 60 * 60 * 1000
});

/**
 * Allowed calculation method IDs (0-23).
 */
var ALLOWED_CALCULATION_METHODS = deepFreeze([
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
]);

/**
 * Allowed Asr school values (0 = Standard, 1 = Hanafi).
 */
var ALLOWED_ASR_SCHOOLS = deepFreeze([0, 1]);

// ====================================================================
// DEFAULT SETTINGS
// ====================================================================

var DEFAULT_SETTINGS = deepFreeze({
  schemaVersion: 4,
  theme: 'dark',
  locale: 'sq-AL',
  city: 'Tiranë',
  country: 'Shqipëri',
  coordinates: null,
  hijriAdjustment: 0,
  enabledModules: ['prayer', 'quran', 'dhikr', 'mburoja', 'dayPlanner', 'settings'],
  homeCards: ['prayer', 'now', 'quran', 'dhikr'],
  hayatAIEnabled: false,
  reducedMotionOverride: 'system',
  home: {
    showSuggestedReadings: true,
    showFridayAlKahf: true,
    showBedtimeQuranReadings: true
  },
  prayer: {
    calculationMethod: 3,
    asrSchool: 1,
    adjustments: {
      fajr: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0
    }
  }
});

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

export function getRouteById(id) {
  if (typeof id !== 'string') return null;
  for (var i = 0; i < ROUTES.length; i++) {
    if (ROUTES[i].id === id) return ROUTES[i];
  }
  return null;
}

export function getRouteByHash(hash) {
  if (typeof hash !== 'string') return null;
  var pathOnly = hash.split('?')[0];
  for (var i = 0; i < ROUTES.length; i++) {
    if (ROUTES[i].hash === pathOnly) return ROUTES[i];
  }
  return null;
}

export function isValidTheme(theme) {
  return APP.supportedThemes.indexOf(theme) !== -1;
}

export function isValidCalculationMethod(value) {
  return typeof value === 'number' &&
    Number.isInteger(value) &&
    ALLOWED_CALCULATION_METHODS.indexOf(value) !== -1;
}

export function isValidAsrSchool(value) {
  return typeof value === 'number' &&
    Number.isInteger(value) &&
    ALLOWED_ASR_SCHOOLS.indexOf(value) !== -1;
}

export function isPrayerKey(value) {
  return typeof value === 'string' && PRAYER_KEYS.indexOf(value) !== -1;
}

export function isTimingKey(value) {
  return typeof value === 'string' && TIMING_KEYS.indexOf(value) !== -1;
}


export function isValidSurahNumber(value) {
  return Number.isInteger(value) && value >= 1 && value <= 114;
}

export function isValidAyahNumber(value) {
  return Number.isInteger(value) && value >= 1 && value <= 286;
}

export function buildVerseKey(surah, ayah) {
  return isValidSurahNumber(surah) && isValidAyahNumber(ayah)
    ? surah + ':' + ayah
    : null;
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
  ALLOWED_REDUCED_MOTION,
  PRAYER_KEYS,
  TIMING_KEYS,
  PRAYER_LABELS_SQ,
  PRAYER_API,
  QURAN_CONTENT_API,
  ALLOWED_CALCULATION_METHODS,
  ALLOWED_ASR_SCHOOLS
};
