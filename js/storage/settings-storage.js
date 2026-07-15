/**
 * Hayat — Settings Storage
 * Validated localStorage persistence for non-sensitive app settings only.
 */

import {
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  ALLOWED_MODULES,
  ALLOWED_HOME_CARDS,
  ALLOWED_REDUCED_MOTION,
  isValidTheme
} from '../config.js';

var CURRENT_SCHEMA_VERSION = DEFAULT_SETTINGS.schemaVersion;
var MAX_STRING_LENGTH = 200;
var MAX_ARRAY_LENGTH = 50;
var KNOWN_KEYS = Object.keys(DEFAULT_SETTINGS);

function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  var prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isBoundedString(value, maxLength) {
  return typeof value === 'string' &&
    value.trim().length > 0 &&
    value.length <= (maxLength || MAX_STRING_LENGTH);
}

function dedupeAllowed(values, allowlist) {
  var seen = new Set();
  var result = [];

  for (var i = 0; i < values.length; i += 1) {
    var value = values[i];
    if (allowlist.indexOf(value) !== -1 && !seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }
  return result;
}

function cloneSettings(settings) {
  return {
    schemaVersion: settings.schemaVersion,
    theme: settings.theme,
    locale: settings.locale,
    city: settings.city,
    country: settings.country,
    coordinates: settings.coordinates
      ? {
          latitude: settings.coordinates.latitude,
          longitude: settings.coordinates.longitude
        }
      : null,
    hijriAdjustment: settings.hijriAdjustment,
    enabledModules: settings.enabledModules.slice(),
    homeCards: settings.homeCards.slice(),
    hayatAIEnabled: settings.hayatAIEnabled,
    reducedMotionOverride: settings.reducedMotionOverride
  };
}

function freezeSettings(settings) {
  if (settings.coordinates) Object.freeze(settings.coordinates);
  Object.freeze(settings.enabledModules);
  Object.freeze(settings.homeCards);
  return Object.freeze(settings);
}

function defaultSettingsCopy() {
  return cloneSettings(DEFAULT_SETTINGS);
}

function validateCoordinates(value) {
  if (value === null || value === undefined) return null;
  if (!isPlainObject(value)) return null;

  var latitude = value.latitude;
  var longitude = value.longitude;
  var validLatitude = typeof latitude === 'number' &&
    Number.isFinite(latitude) && latitude >= -90 && latitude <= 90;
  var validLongitude = typeof longitude === 'number' &&
    Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;

  return validLatitude && validLongitude
    ? { latitude: latitude, longitude: longitude }
    : null;
}

export function validateSettings(candidate) {
  if (!isPlainObject(candidate)) return null;

  var candidateKeys = Object.keys(candidate);
  for (var i = 0; i < candidateKeys.length; i += 1) {
    if (KNOWN_KEYS.indexOf(candidateKeys[i]) === -1) {
      console.warn('[Hayat Settings] Unknown key rejected:', candidateKeys[i]);
      return null;
    }
  }

  var defaults = defaultSettingsCopy();
  var schemaVersion = Number.isInteger(candidate.schemaVersion)
    ? candidate.schemaVersion
    : CURRENT_SCHEMA_VERSION;

  if (schemaVersion !== CURRENT_SCHEMA_VERSION) return null;

  var enabledModules = Array.isArray(candidate.enabledModules)
    ? dedupeAllowed(candidate.enabledModules.slice(0, MAX_ARRAY_LENGTH), ALLOWED_MODULES)
    : defaults.enabledModules;

  var homeCards = Array.isArray(candidate.homeCards)
    ? dedupeAllowed(candidate.homeCards.slice(0, MAX_ARRAY_LENGTH), ALLOWED_HOME_CARDS)
    : defaults.homeCards;

  if (enabledModules.length === 0) enabledModules = defaults.enabledModules;
  if (homeCards.length === 0) homeCards = defaults.homeCards;

  var result = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    theme: isValidTheme(candidate.theme) ? candidate.theme : defaults.theme,
    locale: isBoundedString(candidate.locale, 20)
      ? candidate.locale.trim()
      : defaults.locale,
    city: isBoundedString(candidate.city)
      ? candidate.city.trim()
      : defaults.city,
    country: isBoundedString(candidate.country)
      ? candidate.country.trim()
      : defaults.country,
    coordinates: validateCoordinates(candidate.coordinates),
    hijriAdjustment:
      Number.isInteger(candidate.hijriAdjustment) &&
      candidate.hijriAdjustment >= -2 &&
      candidate.hijriAdjustment <= 2
        ? candidate.hijriAdjustment
        : defaults.hijriAdjustment,
    enabledModules: enabledModules.slice(),
    homeCards: homeCards.slice(),
    hayatAIEnabled: typeof candidate.hayatAIEnabled === 'boolean'
      ? candidate.hayatAIEnabled
      : defaults.hayatAIEnabled,
    reducedMotionOverride:
      ALLOWED_REDUCED_MOTION.indexOf(candidate.reducedMotionOverride) !== -1
        ? candidate.reducedMotionOverride
        : defaults.reducedMotionOverride
  };

  return freezeSettings(result);
}

function migrateSettings(candidate) {
  if (!isPlainObject(candidate)) return null;

  var version = candidate.schemaVersion;
  if (version === undefined) {
    return Object.assign({}, candidate, { schemaVersion: CURRENT_SCHEMA_VERSION });
  }
  if (version === CURRENT_SCHEMA_VERSION) return candidate;

  // Future migrations should be applied one version at a time here.
  return null;
}

export function loadSettings() {
  try {
    var raw = localStorage.getItem(STORAGE_KEYS.settings);
    if (raw === null) return defaultSettingsCopy();

    var migrated = migrateSettings(JSON.parse(raw));
    var validated = validateSettings(migrated);
    if (!validated) {
      console.warn('[Hayat Settings] Invalid persisted settings; using defaults');
      return defaultSettingsCopy();
    }
    return cloneSettings(validated);
  } catch (error) {
    console.warn('[Hayat Settings] Unable to load settings:', error);
    return defaultSettingsCopy();
  }
}

export function saveSettings(settings) {
  var validated = validateSettings(settings);
  if (!validated) throw new Error('Invalid settings: validation failed');

  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(validated));
    localStorage.setItem(
      STORAGE_KEYS.schemaVersion,
      String(validated.schemaVersion)
    );
  } catch (error) {
    console.warn('[Hayat Settings] Unable to persist settings:', error);
  }

  return cloneSettings(validated);
}

export function patchSettings(partialSettings) {
  if (!isPlainObject(partialSettings)) {
    throw new TypeError('Partial settings must be a plain object');
  }
  return saveSettings(Object.assign({}, loadSettings(), partialSettings));
}

export function resetSettings() {
  try {
    localStorage.removeItem(STORAGE_KEYS.settings);
    localStorage.removeItem(STORAGE_KEYS.schemaVersion);
  } catch (error) {
    console.warn('[Hayat Settings] Unable to clear settings:', error);
  }
  return defaultSettingsCopy();
}
