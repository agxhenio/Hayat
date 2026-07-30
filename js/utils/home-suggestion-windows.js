/** Hayat — pure time-window rules for contextual Home suggestions. */

export function isFridayDateKey(dateKey) {
  if (typeof dateKey !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;
  return new Date(dateKey + 'T00:00:00Z').getUTCDay() === 5;
}

export function timeToMinutes(value) {
  if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) return null;
  var parts = value.split(':').map(Number);
  return parts[0] >= 0 && parts[0] <= 23 && parts[1] >= 0 && parts[1] <= 59
    ? parts[0] * 60 + parts[1] : null;
}

export function resolveSuggestionWindows(timings, totalMinutes) {
  var empty = Object.freeze({ morning: false, evening: false, bedtime: false, fridayQuran: false });
  if (!timings || !Number.isInteger(totalMinutes) || totalMinutes < 0 || totalMinutes > 1439) return empty;
  var fajr = timeToMinutes(timings.fajr);
  var imsak = timeToMinutes(timings.imsak || timings.fajr);
  var sunrise = timeToMinutes(timings.sunrise);
  var dhuhr = timeToMinutes(timings.dhuhr);
  var maghrib = timeToMinutes(timings.maghrib);
  var isha = timeToMinutes(timings.isha);
  if ([fajr, imsak, sunrise, dhuhr, maghrib, isha].some(function (value) { return value === null; }) ||
      !(imsak <= fajr && fajr < sunrise && sunrise < dhuhr && dhuhr < maghrib && maghrib < isha)) return empty;
  return Object.freeze({
    morning: totalMinutes >= Math.max(0, sunrise - 20) && totalMinutes < dhuhr,
    evening: totalMinutes >= Math.max(0, maghrib - 20),
    bedtime: totalMinutes >= isha || totalMinutes < imsak,
    fridayQuran: totalMinutes >= sunrise && totalMinutes < maghrib
  });
}
