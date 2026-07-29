/** Hayat — local-only Quran verse bookmarks. */
import { getAllRecords, getRecord, putRecord, deleteRecord } from './database.js';
import { isValidSurahAyah } from '../data/quran-surahs.js';

const STORE = 'quranReadingState';
function key(surah, ayah) { return 'bookmark:' + surah + ':' + ayah; }
function valid(surah, ayah) { return isValidSurahAyah(surah, ayah); }
function validIso(value) { return typeof value === 'string' && Number.isFinite(Date.parse(value)); }

export function validateQuranBookmark(candidate) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate) ||
      Object.keys(candidate).sort().join(',') !== 'ayah,createdAt,key,surah,type' ||
      candidate.type !== 'bookmark' || !valid(candidate.surah, candidate.ayah) ||
      candidate.key !== key(candidate.surah, candidate.ayah) || !validIso(candidate.createdAt)) return null;
  return Object.freeze(Object.assign({}, candidate));
}

export async function isQuranBookmark(surah, ayah) {
  if (!valid(surah, ayah)) return false;
  return Boolean(await getRecord(STORE, key(surah, ayah)));
}

export async function toggleQuranBookmark(surah, ayah) {
  if (!valid(surah, ayah)) throw new TypeError('Invalid Quran verse');
  const recordKey = key(surah, ayah);
  const existing = await getRecord(STORE, recordKey);
  if (existing) { await deleteRecord(STORE, recordKey); return false; }
  await putRecord(STORE, { key: recordKey, type: 'bookmark', surah: surah, ayah: ayah, createdAt: new Date().toISOString() });
  return true;
}

export async function listQuranBookmarks() {
  const all = await getAllRecords(STORE);
  return all.filter(function (item) { return item && item.type === 'bookmark' && valid(item.surah, item.ayah); })
    .sort(function (a, b) { return String(b.createdAt || '').localeCompare(String(a.createdAt || '')); });
}
