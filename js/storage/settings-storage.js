/**
 * Hayat — Validated settings storage, schema v4.
 */

import {
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  ALLOWED_MODULES,
  ALLOWED_HOME_CARDS,
  ALLOWED_REDUCED_MOTION,
  PRAYER_KEYS,
  isValidTheme,
  isValidCalculationMethod,
  isValidAsrSchool
} from '../config.js';

var CURRENT_SCHEMA_VERSION = 4;
var KNOWN_KEYS = Object.keys(DEFAULT_SETTINGS);
var PRAYER_SETTING_KEYS = ['calculationMethod', 'asrSchool', 'adjustments'];
var HOME_SETTING_KEYS = [
  'showSuggestedReadings',
  'showFridayAlKahf',
  'showBedtimeQuranReadings'
];

function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  var prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function validText(value, max) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}

function cloneSettings(settings) {
  return {
    schemaVersion: settings.schemaVersion,
    theme: settings.theme,
    locale: settings.locale,
    city: settings.city,
    country: settings.country,
    coordinates: settings.coordinates
      ? { latitude: settings.coordinates.latitude, longitude: settings.coordinates.longitude }
      : null,
    hijriAdjustment: settings.hijriAdjustment,
    enabledModules: settings.enabledModules.slice(),
    homeCards: settings.homeCards.slice(),
    hayatAIEnabled: settings.hayatAIEnabled,
    reducedMotionOverride: settings.reducedMotionOverride,
    home: {
      showSuggestedReadings: settings.home.showSuggestedReadings,
      showFridayAlKahf: settings.home.showFridayAlKahf,
      showBedtimeQuranReadings: settings.home.showBedtimeQuranReadings
    },
    prayer: {
      calculationMethod: settings.prayer.calculationMethod,
      asrSchool: settings.prayer.asrSchool,
      adjustments: Object.assign({}, settings.prayer.adjustments)
    }
  };
}

function freezeSettings(settings) {
  if (settings.coordinates) Object.freeze(settings.coordinates);
  Object.freeze(settings.enabledModules);
  Object.freeze(settings.homeCards);
  Object.freeze(settings.home);
  Object.freeze(settings.prayer.adjustments);
  Object.freeze(settings.prayer);
  return Object.freeze(settings);
}

function defaults() {
  return cloneSettings(DEFAULT_SETTINGS);
}

function dedupeAllowed(input, allowed, fallback) {
  if (!Array.isArray(input) || input.length === 0 || input.length > 50) {
    return fallback.slice();
  }
  var seen = new Set();
  var result = [];
  for (var i = 0; i < input.length; i += 1) {
    if (allowed.indexOf(input[i]) === -1) return fallback.slice();
    if (!seen.has(input[i])) {
      seen.add(input[i]);
      result.push(input[i]);
    }
  }
  return result.length ? result : fallback.slice();
}

function validateCoordinates(value) {
  if (value === null || value === undefined) return null;
  if (!isPlainObject(value)) return null;
  var keys = Object.keys(value);
  if (keys.some(function (key) { return ['latitude', 'longitude'].indexOf(key) === -1; })) {
    return null;
  }
  return Number.isFinite(value.latitude) && value.latitude >= -90 && value.latitude <= 90 &&
    Number.isFinite(value.longitude) && value.longitude >= -180 && value.longitude <= 180
      ? { latitude: value.latitude, longitude: value.longitude }
      : null;
}

function validatePrayer(value) {
  if (!isPlainObject(value)) return null;
  if (Object.keys(value).some(function (key) {
    return PRAYER_SETTING_KEYS.indexOf(key) === -1;
  })) return null;

  if (value.adjustments !== undefined && !isPlainObject(value.adjustments)) return null;
  var adjustmentInput = value.adjustments || {};
  if (Object.keys(adjustmentInput).some(function (key) {
    return PRAYER_KEYS.indexOf(key) === -1;
  })) return null;

  var adjustments = {};
  PRAYER_KEYS.forEach(function (key) {
    var candidate = adjustmentInput[key];
    adjustments[key] = Number.isInteger(candidate) && candidate >= -30 && candidate <= 30
      ? candidate
      : DEFAULT_SETTINGS.prayer.adjustments[key];
  });

  return {
    calculationMethod: isValidCalculationMethod(value.calculationMethod)
      ? value.calculationMethod
      : DEFAULT_SETTINGS.prayer.calculationMethod,
    asrSchool: isValidAsrSchool(value.asrSchool)
      ? value.asrSchool
      : DEFAULT_SETTINGS.prayer.asrSchool,
    adjustments: adjustments
  };
}

function validateHome(value) {
  if (!isPlainObject(value) || Object.keys(value).some(function (key) {
    return HOME_SETTING_KEYS.indexOf(key) === -1;
  })) return null;
  return {
    showSuggestedReadings: typeof value.showSuggestedReadings === 'boolean'
      ? value.showSuggestedReadings
      : DEFAULT_SETTINGS.home.showSuggestedReadings,
    showFridayAlKahf: typeof value.showFridayAlKahf === 'boolean'
      ? value.showFridayAlKahf
      : DEFAULT_SETTINGS.home.showFridayAlKahf,
    showBedtimeQuranReadings: typeof value.showBedtimeQuranReadings === 'boolean'
      ? value.showBedtimeQuranReadings
      : DEFAULT_SETTINGS.home.showBedtimeQuranReadings
  };
}

function migrateSettings(candidate) {
  if (!isPlainObject(candidate)) return null;
  var version = candidate.schemaVersion === undefined ? 1 : candidate.schemaVersion;
  var migrated = Object.assign({}, candidate);
  if (version === 1) {
    migrated.schemaVersion = 2;
    migrated.prayer = cloneSettings(DEFAULT_SETTINGS).prayer;
    version = 2;
  }
  if (version === 2) {
    migrated.schemaVersion = 3;
    migrated.dhikr = { showBedtimeQuranReadings: true };
    version = 3;
  }
  if (version === 3) {
    var previousBedtimeSetting = migrated.dhikr &&
      typeof migrated.dhikr.showBedtimeQuranReadings === 'boolean'
      ? migrated.dhikr.showBedtimeQuranReadings
      : DEFAULT_SETTINGS.home.showBedtimeQuranReadings;
    migrated.schemaVersion = 4;
    migrated.home = {
      showSuggestedReadings: DEFAULT_SETTINGS.home.showSuggestedReadings,
      showFridayAlKahf: DEFAULT_SETTINGS.home.showFridayAlKahf,
      showBedtimeQuranReadings: previousBedtimeSetting
    };
    delete migrated.dhikr;
    version = 4;
  }
  return version === CURRENT_SCHEMA_VERSION ? migrated : null;
}

export function validateSettings(candidate) {
  if (!isPlainObject(candidate)) return null;
  if (Object.keys(candidate).some(function (key) { return KNOWN_KEYS.indexOf(key) === -1; })) {
    return null;
  }
  if (candidate.schemaVersion !== CURRENT_SCHEMA_VERSION) return null;

  var fallback = defaults();
  var prayer = candidate.prayer === undefined
    ? fallback.prayer
    : validatePrayer(candidate.prayer);
  var home = candidate.home === undefined
    ? fallback.home
    : validateHome(candidate.home);
  if (!prayer || !home) return null;

  var settings = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    theme: isValidTheme(candidate.theme) ? candidate.theme : fallback.theme,
    locale: validText(candidate.locale, 20) ? candidate.locale.trim() : fallback.locale,
    city: validText(candidate.city, 200) ? candidate.city.trim() : fallback.city,
    country: validText(candidate.country, 200) ? candidate.country.trim() : fallback.country,
    coordinates: validateCoordinates(candidate.coordinates),
    hijriAdjustment: Number.isInteger(candidate.hijriAdjustment) &&
      candidate.hijriAdjustment >= -2 && candidate.hijriAdjustment <= 2
        ? candidate.hijriAdjustment : fallback.hijriAdjustment,
    enabledModules: dedupeAllowed(candidate.enabledModules, ALLOWED_MODULES, fallback.enabledModules),
    homeCards: dedupeAllowed(candidate.homeCards, ALLOWED_HOME_CARDS, fallback.homeCards),
    hayatAIEnabled: typeof candidate.hayatAIEnabled === 'boolean'
      ? candidate.hayatAIEnabled : fallback.hayatAIEnabled,
    reducedMotionOverride: ALLOWED_REDUCED_MOTION.indexOf(candidate.reducedMotionOverride) !== -1
      ? candidate.reducedMotionOverride : fallback.reducedMotionOverride,
    home: home,
    prayer: prayer
  };
  return freezeSettings(settings);
}

export function loadSettings() {
  try {
    var raw = localStorage.getItem(STORAGE_KEYS.settings);
    if (!raw) return defaults();
    var validated = validateSettings(migrateSettings(JSON.parse(raw)));
    return validated ? cloneSettings(validated) : defaults();
  } catch (error) {
    console.warn('[Hayat Settings] Unable to load settings:', error);
    return defaults();
  }
}

export function saveSettings(settings) {
  var candidate = migrateSettings(settings);
  var validated = validateSettings(candidate);
  if (!validated) throw new Error('Invalid settings: validation failed');
  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(validated));
    localStorage.setItem(STORAGE_KEYS.schemaVersion, String(CURRENT_SCHEMA_VERSION));
  } catch (error) {
    console.warn('[Hayat Settings] Unable to persist settings:', error);
  }
  return cloneSettings(validated);
}

export function patchSettings(partial) {
  if (!isPlainObject(partial)) throw new TypeError('Partial settings must be a plain object');
  return saveSettings(Object.assign({}, loadSettings(), partial));
}

export function patchPrayerSettings(partial) {
  if (!isPlainObject(partial) || Object.keys(partial).some(function (key) {
    return PRAYER_SETTING_KEYS.indexOf(key) === -1;
  })) throw new TypeError('Invalid partial prayer settings');
  if (partial.adjustments !== undefined && (!isPlainObject(partial.adjustments) ||
      Object.keys(partial.adjustments).some(function (key) {
        return PRAYER_KEYS.indexOf(key) === -1;
      }))) throw new TypeError('Invalid prayer adjustments');

  var current = loadSettings();
  current.prayer = Object.assign({}, current.prayer, partial, {
    adjustments: Object.assign({}, current.prayer.adjustments, partial.adjustments || {})
  });
  return saveSettings(current);
}

export function resetSettings() {
  try {
    localStorage.removeItem(STORAGE_KEYS.settings);
    localStorage.removeItem(STORAGE_KEYS.schemaVersion);
  } catch (error) {
    console.warn('[Hayat Settings] Unable to clear settings:', error);
  }
  return defaults();
}
