/**
 * Hayat — Prayer times service (AlAdhan, cache-first).
 */

import {
  PRAYER_API,
  PRAYER_KEYS,
  TIMING_KEYS,
  isValidCalculationMethod,
  isValidAsrSchool
} from '../config.js';
import {
  parseTimeString,
  applyMinuteAdjustment,
  getZonedDateParts,
  toApiDate,
  addDaysToDateKey,
  resolvePrayerState,
  formatDuration
} from '../utils/date-time.js';
import {
  getCachedPrayerTimes,
  setCachedPrayerTimes,
  clearPrayerCache
} from '../storage/prayer-cache.js';

export class PrayerTimesError extends Error {
  constructor(message, code, options) {
    super(message);
    this.name = 'PrayerTimesError';
    this.code = code;
    this.recoverable = Boolean(options && options.recoverable);
    if (options && options.cause !== undefined) this.cause = options.cause;
  }
}

function validTimeZone(value) {
  if (typeof value !== 'string' || value.trim() === '') return null;
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: value }).format(new Date());
    return value;
  } catch (error) {
    return null;
  }
}

function runtimeTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (error) {
    return 'UTC';
  }
}

function signalLike(value) {
  return value && typeof value.aborted === 'boolean' &&
    typeof value.addEventListener === 'function' &&
    typeof value.removeEventListener === 'function';
}

export function validatePrayerOptions(options) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new PrayerTimesError('Options must be an object', 'INVALID_OPTIONS');
  }
  var date = options.date === undefined ? new Date() : options.date;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new PrayerTimesError('Invalid date', 'INVALID_OPTIONS');
  }
  if (options.latitude === undefined || options.longitude === undefined) {
    throw new PrayerTimesError('Location is required', 'LOCATION_REQUIRED');
  }
  if (!Number.isFinite(options.latitude) || options.latitude < -90 || options.latitude > 90 ||
      !Number.isFinite(options.longitude) || options.longitude < -180 || options.longitude > 180) {
    throw new PrayerTimesError('Invalid coordinates', 'INVALID_OPTIONS');
  }

  var method = options.calculationMethod === undefined
    ? PRAYER_API.defaultMethod : options.calculationMethod;
  var school = options.asrSchool === undefined
    ? PRAYER_API.defaultSchool : options.asrSchool;
  if (!isValidCalculationMethod(method) || !isValidAsrSchool(school)) {
    throw new PrayerTimesError('Invalid calculation method or Asr school', 'INVALID_OPTIONS');
  }

  var adjustmentInput = options.adjustments === undefined ? {} : options.adjustments;
  if (!adjustmentInput || typeof adjustmentInput !== 'object' || Array.isArray(adjustmentInput) ||
      Object.keys(adjustmentInput).some(function (key) { return PRAYER_KEYS.indexOf(key) === -1; })) {
    throw new PrayerTimesError('Invalid adjustments object', 'INVALID_OPTIONS');
  }
  var adjustments = {};
  PRAYER_KEYS.forEach(function (key) {
    var value = adjustmentInput[key] === undefined ? 0 : adjustmentInput[key];
    if (!Number.isInteger(value) || value < -30 || value > 30) {
      throw new PrayerTimesError('Invalid adjustment for ' + key, 'INVALID_OPTIONS');
    }
    adjustments[key] = value;
  });

  if (options.signal !== undefined && !signalLike(options.signal)) {
    throw new PrayerTimesError('Invalid AbortSignal', 'INVALID_OPTIONS');
  }

  return {
    date: new Date(date.getTime()),
    latitude: options.latitude,
    longitude: options.longitude,
    calculationMethod: method,
    asrSchool: school,
    adjustments: adjustments,
    forceRefresh: options.forceRefresh === true,
    signal: options.signal || null,
    timeZone: validTimeZone(options.timeZone) || runtimeTimeZone()
  };
}

function cacheOptions(options, dateKey) {
  return {
    dateKey: dateKey,
    latitude: options.latitude,
    longitude: options.longitude,
    calculationMethod: options.calculationMethod,
    asrSchool: options.asrSchool
  };
}

function dateKeyToApiDate(dateKey) {
  var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return null;
  return toApiDate({ year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) });
}

export function normalizeApiResponse(json, requestContext) {
  if (!json || typeof json !== 'object' || json.code !== 200 ||
      !json.data || !json.data.timings || !json.data.meta) {
    throw new PrayerTimesError('Malformed API response', 'INVALID_RESPONSE');
  }

  var rawTimings = {};
  for (var i = 0; i < TIMING_KEYS.length; i += 1) {
    var key = TIMING_KEYS[i];
    var apiKey = key.charAt(0).toUpperCase() + key.slice(1);
    var parsed = parseTimeString(json.data.timings[apiKey]);
    if (!parsed) throw new PrayerTimesError('Invalid timing: ' + apiKey, 'INVALID_RESPONSE');
    rawTimings[key] = parsed.normalized;
  }
  var parsedImsak = parseTimeString(json.data.timings.Imsak);
  if (!parsedImsak) throw new PrayerTimesError('Invalid timing: Imsak', 'INVALID_RESPONSE');
  var parsedFajr = parseTimeString(rawTimings.fajr);
  if (!parsedFajr || parsedImsak.totalMinutes > parsedFajr.totalMinutes) {
    throw new PrayerTimesError('Imsak must not be after Fajr', 'INVALID_RESPONSE');
  }
  rawTimings.imsak = parsedImsak.normalized;
  if (!resolvePrayerState(rawTimings, 0)) {
    throw new PrayerTimesError('Prayer timings are not strictly ordered', 'INVALID_RESPONSE');
  }

  var timezone = validTimeZone(json.data.meta.timezone);
  if (!timezone) throw new PrayerTimesError('Invalid response timezone', 'INVALID_RESPONSE');

  return {
    dateKey: requestContext.dateKey,
    timezone: timezone,
    rawTimings: rawTimings,
    method: requestContext.calculationMethod,
    school: requestContext.asrSchool,
    latitude: requestContext.latitude,
    longitude: requestContext.longitude,
    fetchedAt: new Date().toISOString()
  };
}

function applyAdjustments(rawTimings, adjustments) {
  var adjusted = {};
  TIMING_KEYS.forEach(function (key) {
    adjusted[key] = key === 'sunrise'
      ? rawTimings[key]
      : applyMinuteAdjustment(rawTimings[key], adjustments[key]);
  });
  var rawImsak = rawTimings.imsak || applyMinuteAdjustment(rawTimings.fajr, -10);
  adjusted.imsak = applyMinuteAdjustment(rawImsak, adjustments.fajr);
  var adjustedImsak = parseTimeString(adjusted.imsak);
  var adjustedFajr = parseTimeString(adjusted.fajr);
  if (Object.values(adjusted).some(function (value) { return value === null; }) ||
      !adjustedImsak || !adjustedFajr || adjustedImsak.totalMinutes > adjustedFajr.totalMinutes ||
      !resolvePrayerState(adjusted, 0)) {
    throw new PrayerTimesError('Adjusted timings are not valid', 'INVALID_RESPONSE');
  }
  return adjusted;
}

function resultFromPayload(payload, options, source) {
  return {
    dateKey: payload.dateKey,
    timezone: payload.timezone,
    source: source,
    fetchedAt: payload.fetchedAt,
    method: payload.method,
    school: payload.school,
    location: { latitude: payload.latitude, longitude: payload.longitude },
    timings: applyAdjustments(payload.rawTimings, options.adjustments),
    rawTimings: Object.assign({}, payload.rawTimings)
  };
}

async function fetchPayload(options, dateKey) {
  var apiDate = dateKeyToApiDate(dateKey);
  if (!apiDate) throw new PrayerTimesError('Invalid request date', 'INVALID_OPTIONS');

  var url = new URL(PRAYER_API.baseUrl + '/timings/' + apiDate);
  url.searchParams.set('latitude', String(options.latitude));
  url.searchParams.set('longitude', String(options.longitude));
  url.searchParams.set('method', String(options.calculationMethod));
  url.searchParams.set('school', String(options.asrSchool));

  var controller = new AbortController();
  var timedOut = false;
  var externalAbort = function () { controller.abort(); };
  if (options.signal) {
    if (options.signal.aborted) throw new PrayerTimesError('Request aborted', 'ABORTED');
    options.signal.addEventListener('abort', externalAbort, { once: true });
  }
  var timer = setTimeout(function () {
    timedOut = true;
    controller.abort();
  }, PRAYER_API.timeoutMs);

  try {
    var response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new PrayerTimesError('Prayer API HTTP ' + response.status, 'HTTP_ERROR', {
        recoverable: true
      });
    }
    var json;
    try {
      json = await response.json();
    } catch (error) {
      throw new PrayerTimesError('Prayer API returned invalid JSON', 'INVALID_RESPONSE', {
        cause: error
      });
    }
    return normalizeApiResponse(json, Object.assign({}, options, { dateKey: dateKey }));
  } catch (error) {
    if (error instanceof PrayerTimesError) throw error;
    if (error && error.name === 'AbortError') {
      if (options.signal && options.signal.aborted) {
        throw new PrayerTimesError('Request aborted', 'ABORTED');
      }
      if (timedOut) {
        throw new PrayerTimesError('Prayer API timeout', 'TIMEOUT', { recoverable: true });
      }
    }
    throw new PrayerTimesError('Prayer API network error', 'NETWORK_ERROR', {
      recoverable: true,
      cause: error
    });
  } finally {
    clearTimeout(timer);
    if (options.signal) options.signal.removeEventListener('abort', externalAbort);
  }
}

function canFallBack(error) {
  return error && ['NETWORK_ERROR', 'TIMEOUT', 'HTTP_ERROR'].indexOf(error.code) !== -1;
}

async function getForDateKey(options, dateKey) {
  var keyOptions = cacheOptions(options, dateKey);
  if (!options.forceRefresh) {
    var initialCache = getCachedPrayerTimes(keyOptions);
    if (initialCache) return resultFromPayload(initialCache, options, 'cache');
  }

  try {
    var payload = await fetchPayload(options, dateKey);
    setCachedPrayerTimes(keyOptions, payload);
    return resultFromPayload(payload, options, 'network');
  } catch (error) {
    if (canFallBack(error)) {
      var fallback = getCachedPrayerTimes(keyOptions);
      if (fallback) return resultFromPayload(fallback, options, 'cache');
    }
    throw error;
  }
}

export async function getPrayerTimes(options) {
  var normalized = validatePrayerOptions(options);
  var parts = getZonedDateParts(normalized.date, normalized.timeZone);
  if (!parts) throw new PrayerTimesError('Unable to determine zoned date', 'INVALID_OPTIONS');
  return getForDateKey(normalized, parts.dateKey);
}

export async function getTodayAndTomorrowPrayerTimes(options) {
  var normalized = validatePrayerOptions(options);
  var parts = getZonedDateParts(normalized.date, normalized.timeZone);
  if (!parts) throw new PrayerTimesError('Unable to determine zoned date', 'INVALID_OPTIONS');

  var today = await getForDateKey(normalized, parts.dateKey);
  var tomorrowKey = addDaysToDateKey(today.dateKey, 1);
  var tomorrow = null;
  if (tomorrowKey) {
    try {
      tomorrow = await getForDateKey(
        Object.assign({}, normalized, { forceRefresh: false, timeZone: today.timezone }),
        tomorrowKey
      );
    } catch (error) {
      if (error instanceof PrayerTimesError && error.code === 'ABORTED') throw error;
      tomorrow = null;
    }
  }
  return { today: today, tomorrow: tomorrow };
}

export function getPrayerState(todayResult, now, tomorrowResult) {
  if (!todayResult || !todayResult.timings) return null;
  var instant = now === undefined ? new Date() : now;
  var zonedNow = getZonedDateParts(instant, todayResult.timezone);
  if (!zonedNow) return null;

  var tomorrowFajr = tomorrowResult && tomorrowResult.timings
    ? tomorrowResult.timings.fajr : null;
  var state = resolvePrayerState(todayResult.timings, zonedNow.totalMinutes, tomorrowFajr);
  if (!state) return null;

  var secondsUntilNext = state.secondsUntilNext === null
    ? null
    : Math.max(0, state.secondsUntilNext - zonedNow.seconds);
  var secondsUntilCurrentEnd = state.secondsUntilCurrentEnd === null
    ? null
    : Math.max(0, state.secondsUntilCurrentEnd - zonedNow.seconds);

  return Object.assign({}, state, {
    secondsUntilNext: secondsUntilNext,
    secondsUntilCurrentEnd: secondsUntilCurrentEnd,
    zonedNow: zonedNow,
    duration: secondsUntilNext === null ? null : formatDuration(secondsUntilNext),
    durationToCurrentEnd: secondsUntilCurrentEnd === null
      ? null
      : formatDuration(secondsUntilCurrentEnd)
  });
}

export function clearPrayerTimesCache() {
  return clearPrayerCache();
}
