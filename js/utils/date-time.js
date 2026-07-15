/**
 * Hayat — Pure date/time utilities.
 */

var DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function validDateParts(year, month, day) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }
  var date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
}

function parseDateKey(dateKey) {
  if (typeof dateKey !== 'string') return null;
  var match = dateKey.match(DATE_KEY_PATTERN);
  if (!match) return null;
  var parts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3])
  };
  return validDateParts(parts.year, parts.month, parts.day) ? parts : null;
}

function runtimeTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (error) {
    return 'UTC';
  }
}

function validTimeZone(timeZone) {
  if (typeof timeZone !== 'string' || timeZone.trim() === '') return null;
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: timeZone }).format(new Date());
    return timeZone;
  } catch (error) {
    return null;
  }
}

export function parseTimeString(value) {
  if (typeof value !== 'string') return null;
  var trimmed = value.trim();
  var match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s+\([^)]*\))?$/);
  if (!match) return null;

  var hours = Number(match[1]);
  var minutes = Number(match[2]);
  var seconds = match[3] === undefined ? 0 : Number(match[3]);

  if (!Number.isInteger(hours) || hours < 0 || hours > 23 ||
      !Number.isInteger(minutes) || minutes < 0 || minutes > 59 ||
      !Number.isInteger(seconds) || seconds < 0 || seconds > 59) {
    return null;
  }

  return {
    hours: hours,
    minutes: minutes,
    totalMinutes: hours * 60 + minutes,
    normalized: String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0')
  };
}

export function minutesToTime(totalMinutes) {
  if (typeof totalMinutes !== 'number' || !Number.isFinite(totalMinutes)) return null;
  var normalized = ((Math.trunc(totalMinutes) % 1440) + 1440) % 1440;
  return String(Math.floor(normalized / 60)).padStart(2, '0') + ':' +
    String(normalized % 60).padStart(2, '0');
}

export function applyMinuteAdjustment(time, adjustment) {
  if (!Number.isInteger(adjustment)) return null;
  var parsed = typeof time === 'string' ? parseTimeString(time) : time;
  if (!parsed || !Number.isFinite(parsed.totalMinutes)) return null;
  return minutesToTime(parsed.totalMinutes + adjustment);
}

export function formatDuration(totalSeconds) {
  var safeSeconds = Number.isFinite(totalSeconds)
    ? Math.max(0, Math.floor(totalSeconds))
    : 0;
  var hours = Math.floor(safeSeconds / 3600);
  var minutes = Math.floor((safeSeconds % 3600) / 60);
  var seconds = safeSeconds % 60;
  var compact;

  if (hours > 0) compact = hours + ' orë' + (minutes ? ' ' + minutes + ' min' : '');
  else if (minutes > 0) compact = minutes + ' min';
  else compact = 'më pak se 1 min';

  return {
    hours: hours,
    minutes: minutes,
    seconds: seconds,
    clock: String(hours).padStart(2, '0') + ':' +
      String(minutes).padStart(2, '0') + ':' +
      String(seconds).padStart(2, '0'),
    compact: compact
  };
}

export function toDateKey(parts) {
  if (!parts || !validDateParts(parts.year, parts.month, parts.day)) return null;
  return String(parts.year).padStart(4, '0') + '-' +
    String(parts.month).padStart(2, '0') + '-' +
    String(parts.day).padStart(2, '0');
}

export function toApiDate(parts) {
  if (!parts || !validDateParts(parts.year, parts.month, parts.day)) return null;
  return String(parts.day).padStart(2, '0') + '-' +
    String(parts.month).padStart(2, '0') + '-' +
    String(parts.year).padStart(4, '0');
}

export function getZonedDateParts(date, timeZone) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  var effectiveTimeZone = validTimeZone(timeZone) || runtimeTimeZone();

  try {
    var formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: effectiveTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    });
    var values = {};
    formatter.formatToParts(date).forEach(function (part) {
      if (part.type !== 'literal') values[part.type] = part.value;
    });

    var result = {
      year: Number(values.year),
      month: Number(values.month),
      day: Number(values.day),
      hours: Number(values.hour),
      minutes: Number(values.minute),
      seconds: Number(values.second),
      timeZone: effectiveTimeZone
    };
    result.dateKey = toDateKey(result);
    if (!result.dateKey || result.hours < 0 || result.hours > 23 ||
        result.minutes < 0 || result.minutes > 59 ||
        result.seconds < 0 || result.seconds > 59) return null;
    result.totalMinutes = result.hours * 60 + result.minutes;
    return result;
  } catch (error) {
    return null;
  }
}

export function addDaysToDateKey(dateKey, amount) {
  var parts = parseDateKey(dateKey);
  if (!parts || !Number.isInteger(amount)) return null;
  var date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + amount));
  return toDateKey({
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate()
  });
}

export function compareDateKeys(a, b) {
  if (!parseDateKey(a) || !parseDateKey(b)) return null;
  return a === b ? 0 : (a < b ? -1 : 1);
}

export function resolvePrayerState(timings, currentTotalMinutes, tomorrowFajr) {
  if (!timings || typeof timings !== 'object' ||
      !Number.isFinite(currentTotalMinutes) ||
      currentTotalMinutes < 0 || currentTotalMinutes >= 1440) return null;

  var keys = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  var parsed = {};
  for (var i = 0; i < keys.length; i += 1) {
    parsed[keys[i]] = parseTimeString(timings[keys[i]]);
    if (!parsed[keys[i]]) return null;
  }

  var t = {};
  keys.forEach(function (key) { t[key] = parsed[key].totalMinutes; });
  if (!(t.fajr < t.sunrise && t.sunrise < t.dhuhr && t.dhuhr < t.asr &&
        t.asr < t.maghrib && t.maghrib < t.isha)) return null;

  function state(currentPrayer, nextPrayer, currentEndsAt, nextAt, seconds, tomorrow) {
    return {
      currentPrayer: currentPrayer,
      nextPrayer: nextPrayer,
      currentEndsAt: currentEndsAt,
      nextPrayerAt: nextAt,
      secondsUntilNext: seconds === null ? null : Math.max(0, seconds),
      nextPrayerIsTomorrow: tomorrow
    };
  }

  if (currentTotalMinutes < t.fajr) {
    return state(null, 'fajr', null, parsed.fajr.normalized,
      (t.fajr - currentTotalMinutes) * 60, false);
  }
  if (currentTotalMinutes < t.sunrise) {
    return state('fajr', 'dhuhr', parsed.sunrise.normalized, parsed.dhuhr.normalized,
      (t.dhuhr - currentTotalMinutes) * 60, false);
  }
  if (currentTotalMinutes < t.dhuhr) {
    return state(null, 'dhuhr', null, parsed.dhuhr.normalized,
      (t.dhuhr - currentTotalMinutes) * 60, false);
  }
  if (currentTotalMinutes < t.asr) {
    return state('dhuhr', 'asr', parsed.asr.normalized, parsed.asr.normalized,
      (t.asr - currentTotalMinutes) * 60, false);
  }
  if (currentTotalMinutes < t.maghrib) {
    return state('asr', 'maghrib', parsed.maghrib.normalized, parsed.maghrib.normalized,
      (t.maghrib - currentTotalMinutes) * 60, false);
  }
  if (currentTotalMinutes < t.isha) {
    return state('maghrib', 'isha', parsed.isha.normalized, parsed.isha.normalized,
      (t.isha - currentTotalMinutes) * 60, false);
  }

  var tomorrow = parseTimeString(tomorrowFajr);
  return state(
    'isha',
    'fajr',
    null,
    tomorrow ? tomorrow.normalized : null,
    tomorrow ? ((1440 - currentTotalMinutes) + tomorrow.totalMinutes) * 60 : null,
    true
  );
}
