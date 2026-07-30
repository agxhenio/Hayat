import assert from 'node:assert/strict';
import {
  isFridayDateKey,
  timeToMinutes,
  resolveSuggestionWindows
} from '../js/utils/home-suggestion-windows.js';

const timings = Object.freeze({
  imsak: '03:08',
  fajr: '03:18',
  sunrise: '05:20',
  dhuhr: '12:47',
  asr: '17:58',
  maghrib: '20:13',
  isha: '22:06'
});

function state(time) {
  return resolveSuggestionWindows(timings, timeToMinutes(time));
}

assert.equal(state('04:59').morning, false);
assert.equal(state('05:00').morning, true);
assert.equal(state('12:46').morning, true);
assert.equal(state('12:47').morning, false);

assert.equal(state('19:52').evening, false);
assert.equal(state('19:53').evening, true);
assert.equal(state('23:59').evening, true);
assert.equal(state('00:00').evening, false);

assert.equal(state('22:05').bedtime, false);
assert.equal(state('22:06').bedtime, true);
assert.equal(state('03:07').bedtime, true);
assert.equal(state('03:08').bedtime, false);

assert.equal(state('05:19').fridayQuran, false);
assert.equal(state('05:20').fridayQuran, true);
assert.equal(state('20:12').fridayQuran, true);
assert.equal(state('20:13').fridayQuran, false);

assert.equal(isFridayDateKey('2026-07-31'), true);
assert.equal(isFridayDateKey('2026-08-01'), false);
assert.deepEqual(resolveSuggestionWindows(null, 300), {
  morning: false,
  evening: false,
  bedtime: false,
  fridayQuran: false
});
assert.deepEqual(resolveSuggestionWindows({ ...timings, imsak: '03:30' }, 100), {
  morning: false,
  evening: false,
  bedtime: false,
  fridayQuran: false
});

console.log('Home suggestion window tests: OK');
