import assert from 'node:assert/strict';
import { isFridayDateKey, timeToMinutes, resolveSuggestionWindows } from '../js/utils/home-suggestion-windows.js';

const timings = Object.freeze({
  fajr: '03:18', sunrise: '05:20', dhuhr: '12:47',
  asr: '17:58', maghrib: '20:13', isha: '22:06'
});

function state(minute) { return resolveSuggestionWindows(timings, minute); }

assert.equal(timeToMinutes('05:20'), 320);
assert.equal(timeToMinutes('24:00'), null);
assert.equal(timeToMinutes('5:20'), null);

// Morning: exactly 20 minutes before sunrise, until (not including) Dhuhr.
assert.equal(state(299).morning, false);
assert.equal(state(300).morning, true);
assert.equal(state(766).morning, true);
assert.equal(state(767).morning, false);

// Evening: exactly 20 minutes before Maghrib, through 23:59.
assert.equal(state(1192).evening, false);
assert.equal(state(1193).evening, true);
assert.equal(state(1439).evening, true);
assert.equal(state(0).evening, false);

// Bedtime: after Isha through the Fajr/Imsak boundary.
assert.equal(state(1325).bedtime, false);
assert.equal(state(1326).bedtime, true);
assert.equal(state(0).bedtime, true);
assert.equal(state(197).bedtime, true);
assert.equal(state(198).bedtime, false);

// Friday Quran daylight window: sunrise through before Maghrib.
assert.equal(state(319).fridayQuran, false);
assert.equal(state(320).fridayQuran, true);
assert.equal(state(1212).fridayQuran, true);
assert.equal(state(1213).fridayQuran, false);
assert.equal(isFridayDateKey('2026-07-31'), true);
assert.equal(isFridayDateKey('2026-08-01'), false);

// Invalid or unordered prayer data must never create guessed suggestions.
assert.deepEqual(resolveSuggestionWindows(null, 600), {
  morning: false, evening: false, bedtime: false, fridayQuran: false
});
assert.deepEqual(resolveSuggestionWindows({ ...timings, sunrise: '02:00' }, 600), {
  morning: false, evening: false, bedtime: false, fridayQuran: false
});

console.log('Home suggestion window tests: OK');
