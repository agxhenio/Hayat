/**
 * Hayat — Validated localStorage cache for prayer timings.
 */

import {
  STORAGE_KEYS,
  PRAYER_API,
  TIMING_KEYS,
  isValidCalculationMethod,
  isValidAsrSchool
} from '../config.js';
import {
  parseTimeString,
  compareDateKeys,
  resolvePrayerState
} from '../utils/date-time.js';

var CACHE_VERSION = 1;

function emptyCache() {
  return { version: CACHE_VERSION, entries: {} };
}

function validCoordinates(latitude, longitude) {
  return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 &&
    Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
}

function clonePayload(payload) {
  return {
    dateKey: payload.dateKey,
    timezone: payload.timezone,
    rawTimings: Object.assign({}, payload.rawTimings),
    method: payload.method,
    school: payload.school,
    latitude: payload.latitude,
    longitude: payload.longitude,
    fetchedAt: payload.fetchedAt
  };
}

function validDateKey(dateKey) {
  return compareDateKeys(dateKey, dateKey) === 0;
}

function validTimezone(timezone) {
  if (typeof timezone !== 'string' || timezone.trim() === '') return false;
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: timezone }).format(new Date());
    return true;
  } catch (error) {
    return false;
  }
}

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) ||
      !validDateKey(payload.dateKey) || !validTimezone(payload.timezone) ||
      !isValidCalculationMethod(payload.method) ||
      !isValidAsrSchool(payload.school) ||
      !validCoordinates(payload.latitude, payload.longitude) ||
      typeof payload.fetchedAt !== 'string' ||
      !Number.isFinite(Date.parse(payload.fetchedAt)) ||
      !payload.rawTimings || typeof payload.rawTimings !== 'object') {
    return false;
  }

  var normalized = {};
  for (var i = 0; i < TIMING_KEYS.length; i += 1) {
    var key = TIMING_KEYS[i];
    var parsed = parseTimeString(payload.rawTimings[key]);
    if (!parsed) return false;
    normalized[key] = parsed.normalized;
  }
  return resolvePrayerState(normalized, 0) !== null;
}

function loadCache() {
  try {
    var raw = localStorage.getItem(STORAGE_KEYS.prayerCache);
    if (!raw) return emptyCache();
    var cache = JSON.parse(raw);
    if (!cache || cache.version !== CACHE_VERSION ||
        !cache.entries || typeof cache.entries !== 'object' ||
        Array.isArray(cache.entries)) return emptyCache();
    return cache;
  } catch (error) {
    return emptyCache();
  }
}

function saveCache(cache) {
  try {
    localStorage.setItem(STORAGE_KEYS.prayerCache, JSON.stringify(cache));
    return true;
  } catch (error) {
    console.warn('[Hayat Prayer Cache] Unable to persist cache:', error);
    return false;
  }
}

export function buildPrayerCacheKey(options) {
  if (!options || typeof options !== 'object' ||
      !validDateKey(options.dateKey) ||
      !validCoordinates(options.latitude, options.longitude) ||
      !isValidCalculationMethod(options.calculationMethod) ||
      !isValidAsrSchool(options.asrSchool)) return null;

  return [
    options.dateKey,
    Number(options.latitude).toFixed(4),
    Number(options.longitude).toFixed(4),
    'm' + options.calculationMethod,
    's' + options.asrSchool
  ].join('|');
}

export function getCachedPrayerTimes(options) {
  var key = buildPrayerCacheKey(options);
  if (!key) return null;
  var entry = loadCache().entries[key];
  if (!entry || !Number.isFinite(Date.parse(entry.cachedAt)) ||
      Date.now() - Date.parse(entry.cachedAt) > PRAYER_API.cacheMaxAgeMs ||
      !validatePayload(entry.payload)) return null;

  var payload = entry.payload;
  if (payload.dateKey !== options.dateKey ||
      Number(payload.latitude).toFixed(4) !== Number(options.latitude).toFixed(4) ||
      Number(payload.longitude).toFixed(4) !== Number(options.longitude).toFixed(4) ||
      payload.method !== options.calculationMethod ||
      payload.school !== options.asrSchool) return null;

  return clonePayload(payload);
}

export function setCachedPrayerTimes(options, payload) {
  var key = buildPrayerCacheKey(options);
  if (!key || !validatePayload(payload)) return false;

  var cache = loadCache();
  cache.entries[key] = {
    cachedAt: new Date().toISOString(),
    payload: clonePayload(payload)
  };
  prunePrayerCache(cache);
  return saveCache(cache);
}

export function removeCachedPrayerTimes(options) {
  var key = buildPrayerCacheKey(options);
  if (!key) return false;
  var cache = loadCache();
  delete cache.entries[key];
  return saveCache(cache);
}

export function clearPrayerCache() {
  try {
    localStorage.removeItem(STORAGE_KEYS.prayerCache);
    return true;
  } catch (error) {
    return false;
  }
}

export function prunePrayerCache(cache) {
  var target = cache || loadCache();
  var entries = target.entries;
  var now = Date.now();

  Object.keys(entries).forEach(function (key) {
    var entry = entries[key];
    var timestamp = entry && Date.parse(entry.cachedAt);
    if (!Number.isFinite(timestamp) || now - timestamp > PRAYER_API.cacheMaxAgeMs ||
        !validatePayload(entry.payload)) delete entries[key];
  });

  var keys = Object.keys(entries).sort(function (a, b) {
    return Date.parse(entries[a].cachedAt) - Date.parse(entries[b].cachedAt);
  });
  while (keys.length > PRAYER_API.cacheMaxEntries) {
    delete entries[keys.shift()];
  }

  return cache ? true : saveCache(target);
}
