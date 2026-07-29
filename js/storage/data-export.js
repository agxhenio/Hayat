/** Hayat — local-first personal data export. */
import { getAllRecords } from './database.js';
import { exportMburojaLocalState } from './mburoja-state-backup.js';

export const DATA_EXPORT_VERSION = 2;
const PERSONAL_STORES = Object.freeze([
  'prayerLogs',
  'postPrayerDhikrSessions',
  'dailyDhikrSessions',
  'dayItems',
  'dayItemOccurrences',
  'quranReadingState',
  'meta'
]);

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

export async function createPersonalDataExport(settings) {
  const records = await Promise.all(PERSONAL_STORES.map(function (storeName) {
    return getAllRecords(storeName);
  }));
  const stores = {};
  PERSONAL_STORES.forEach(function (storeName, index) {
    stores[storeName] = cloneJson(records[index] || []);
  });
  return Object.freeze({
    format: 'hayat-personal-data',
    version: DATA_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    settings: cloneJson(settings),
    localState: { mburoja: cloneJson(exportMburojaLocalState()) },
    stores: stores
  });
}

export function personalDataExportFilename(date) {
  const source = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  const dateKey = [source.getFullYear(), String(source.getMonth() + 1).padStart(2, '0'), String(source.getDate()).padStart(2, '0')].join('-');
  return 'hayat-te-dhenat-' + dateKey + '.json';
}
