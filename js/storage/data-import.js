/** Hayat — strict, validated local-only personal data restore. */
import { replaceRecordsAtomically } from './database.js';
import { validateSettings } from './settings-storage.js';
import { DATA_EXPORT_VERSION } from './data-export.js';
import { validatePrayerLog } from './prayer-log.js';
import { validatePostPrayerDhikrSession } from './post-prayer-dhikr-progress.js';
import { validateDailyDhikrSession } from './daily-dhikr-progress.js';
import { validateDayItem, validateDayItemOccurrence } from './day-planner.js';
import { validateQuranReadingPosition } from './quran-reading.js';
import { validateQuranBookmark } from './quran-bookmarks.js';
import { isValidSurahAyah } from '../data/quran-surahs.js';
import { validateMburojaLocalState, restoreMburojaLocalState } from './mburoja-state-backup.js';

const PERSONAL_STORES = Object.freeze([
  'prayerLogs', 'postPrayerDhikrSessions', 'dailyDhikrSessions',
  'dayItems', 'dayItemOccurrences', 'quranReadingState', 'meta'
]);
const KEY_FIELDS = Object.freeze({ quranReadingState: 'key', meta: 'key' });
const MAX_RECORDS_PER_STORE = 50000;
const LEGACY_EXPORT_VERSION = 1;

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
function validIso(value) { return typeof value === 'string' && Number.isFinite(Date.parse(value)); }
function validateQuranStateRecord(record) {
  return record && record.type === 'bookmark'
    ? validateQuranBookmark(record)
    : validateQuranReadingPosition(record);
}
function validateMetaRecord(record) {
  if (!isPlainObject(record) || record.key !== 'quran-search-index-v1' || record.version !== 1 ||
      record.provider !== 'QuranEnc' || record.translationKey !== 'albanian_nahi' ||
      !validIso(record.createdAt) || !Array.isArray(record.entries) || record.entries.length > 7000 ||
      Object.keys(record).sort().join(',') !== 'createdAt,entries,key,provider,translationKey,version') return null;
  const entries = [];
  for (let i = 0; i < record.entries.length; i += 1) {
    const entry = record.entries[i];
    if (!isPlainObject(entry) || Object.keys(entry).sort().join(',') !== 'ayah,surah,text' ||
        !isValidSurahAyah(entry.surah, entry.ayah) || typeof entry.text !== 'string' || entry.text.length > 10000) return null;
    entries.push({ surah: entry.surah, ayah: entry.ayah, text: entry.text });
  }
  return Object.freeze({
    key: record.key, version: 1, provider: record.provider,
    translationKey: record.translationKey, createdAt: record.createdAt,
    entries: entries
  });
}

const STORE_VALIDATORS = Object.freeze({
  prayerLogs: validatePrayerLog,
  postPrayerDhikrSessions: validatePostPrayerDhikrSession,
  dailyDhikrSessions: validateDailyDhikrSession,
  dayItems: validateDayItem,
  dayItemOccurrences: validateDayItemOccurrence,
  quranReadingState: validateQuranStateRecord,
  meta: validateMetaRecord
});

function validateStoreRecords(name, records) {
  if (!Array.isArray(records) || records.length > MAX_RECORDS_PER_STORE) return null;
  const keyField = KEY_FIELDS[name] || 'id';
  const validator = STORE_VALIDATORS[name];
  const normalized = [];
  const keys = new Set();
  for (let i = 0; i < records.length; i += 1) {
    const record = records[i];
    if (!isPlainObject(record) || typeof record[keyField] !== 'string' || !record[keyField] ||
        keys.has(record[keyField])) return null;
    const valid = validator(record);
    if (!valid) return null;
    keys.add(record[keyField]);
    normalized.push(valid);
  }
  return normalized;
}

function validOccurrenceRelations(stores) {
  const templates = new Map(stores.dayItems.map(function (item) { return [item.id, item]; }));
  return stores.dayItemOccurrences.every(function (occurrence) {
    const template = templates.get(occurrence.templateId);
    return Boolean(template && template.recurrence !== 'none' && occurrence.dateKey >= template.dateKey);
  });
}

export function validatePersonalDataImport(candidate) {
  if (!isPlainObject(candidate) || candidate.format !== 'hayat-personal-data' ||
      [LEGACY_EXPORT_VERSION, DATA_EXPORT_VERSION].indexOf(candidate.version) === -1 ||
      !isPlainObject(candidate.stores) || !validateSettings(candidate.settings)) return null;
  if (Object.keys(candidate.stores).some(function (name) { return PERSONAL_STORES.indexOf(name) === -1; })) return null;

  const stores = {};
  for (let i = 0; i < PERSONAL_STORES.length; i += 1) {
    const name = PERSONAL_STORES[i];
    var records = candidate.stores[name];
    if (candidate.version === LEGACY_EXPORT_VERSION && name === 'dayItemOccurrences' && records === undefined) records = [];
    const validRecords = validateStoreRecords(name, records);
    if (!validRecords) return null;
    stores[name] = validRecords;
  }
  if (!validOccurrenceRelations(stores)) return null;

  var localState = null;
  if (candidate.version === DATA_EXPORT_VERSION) {
    if (!isPlainObject(candidate.localState) || Object.keys(candidate.localState).join(',') !== 'mburoja') return null;
    localState = validateMburojaLocalState(candidate.localState.mburoja);
    if (!localState) return null;
  }
  return Object.freeze({
    settings: validateSettings(candidate.settings),
    stores: stores,
    localState: localState
  });
}

export async function restorePersonalData(candidate, saveSettings) {
  const valid = validatePersonalDataImport(candidate);
  if (!valid || typeof saveSettings !== 'function') throw new TypeError('Invalid Hayat backup');
  await replaceRecordsAtomically(valid.stores);
  const settings = await saveSettings(valid.settings);
  if (valid.localState) restoreMburojaLocalState(valid.localState);
  return settings;
}
