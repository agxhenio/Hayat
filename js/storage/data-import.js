/** Hayat — validated local-only personal data restore. */
import { replaceRecordsAtomically } from './database.js';
import { validateSettings } from './settings-storage.js';
import { DATA_EXPORT_VERSION } from './data-export.js';
import { validatePrayerLog } from './prayer-log.js';
import { validatePostPrayerDhikrSession } from './post-prayer-dhikr-progress.js';
import { validateDailyDhikrSession } from './daily-dhikr-progress.js';
import { validateDayItem, validateDayItemOccurrence } from './day-planner.js';
import { validateQuranReadingPosition } from './quran-reading.js';

const PERSONAL_STORES = Object.freeze([
  'prayerLogs', 'postPrayerDhikrSessions', 'dailyDhikrSessions',
  'dayItems', 'dayItemOccurrences', 'quranReadingState', 'meta'
]);
const KEY_FIELDS = Object.freeze({ quranReadingState: 'key', meta: 'key' });
const MAX_RECORDS_PER_STORE = 50000;

const STORE_VALIDATORS = Object.freeze({
  prayerLogs: validatePrayerLog,
  postPrayerDhikrSessions: validatePostPrayerDhikrSession,
  dailyDhikrSessions: validateDailyDhikrSession,
  dayItems: validateDayItem,
  dayItemOccurrences: validateDayItemOccurrence,
  quranReadingState: validateQuranReadingPosition
});

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function validatePersonalDataImport(candidate) {
  if (!isPlainObject(candidate) || candidate.format !== 'hayat-personal-data' ||
      candidate.version !== DATA_EXPORT_VERSION || !isPlainObject(candidate.stores) ||
      !validateSettings(candidate.settings)) return null;
  if (Object.keys(candidate.stores).some(function (name) { return PERSONAL_STORES.indexOf(name) === -1; })) return null;
  const stores = {};
  for (let i = 0; i < PERSONAL_STORES.length; i += 1) {
    const name = PERSONAL_STORES[i];
    const records = candidate.stores[name];
    if (!Array.isArray(records) || records.length > MAX_RECORDS_PER_STORE || records.some(function (record) {
      const keyField = KEY_FIELDS[name] || 'id';
      return !isPlainObject(record) || typeof record[keyField] !== 'string' || !record[keyField];
    })) return null;
    const validator = STORE_VALIDATORS[name];
    if (validator) {
      stores[name] = records.map(validator).filter(Boolean);
    } else {
      stores[name] = records;
    }
  }
  return Object.freeze({ settings: validateSettings(candidate.settings), stores: stores });
}

export async function restorePersonalData(candidate, saveSettings) {
  const valid = validatePersonalDataImport(candidate);
  if (!valid || typeof saveSettings !== 'function') throw new TypeError('Invalid Hayat backup');
  await replaceRecordsAtomically(valid.stores);
  return saveSettings(valid.settings);
}
