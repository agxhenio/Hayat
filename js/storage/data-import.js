/** Hayat — validated local-only personal data restore. */
import { replaceRecordsAtomically } from './database.js';
import { validateSettings } from './settings-storage.js';
import { DATA_EXPORT_VERSION } from './data-export.js';

const PERSONAL_STORES = Object.freeze([
  'prayerLogs', 'postPrayerDhikrSessions', 'dailyDhikrSessions',
  'dayItems', 'quranReadingState', 'meta'
]);
const KEY_FIELDS = Object.freeze({ quranReadingState: 'key', meta: 'key' });
const MAX_RECORDS_PER_STORE = 50000;

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
    stores[name] = records;
  }
  return Object.freeze({ settings: validateSettings(candidate.settings), stores: stores });
}

export async function restorePersonalData(candidate, saveSettings) {
  const valid = validatePersonalDataImport(candidate);
  if (!valid || typeof saveSettings !== 'function') throw new TypeError('Invalid Hayat backup');
  await replaceRecordsAtomically(valid.stores);
  return saveSettings(valid.settings);
}
